use js_sys::{Date, Promise, Uint8Array};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::XmlHttpRequest;
use super::network_cache::{insert_cache_future, get_cache_future};
use futures::future;
use futures::FutureExt;


use crate::constants::{
    FETCH_ERROR, XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR, XML_HTTP_REQUEST_CREATE_ERROR,
    XML_HTTP_REQUEST_OPEN_ERROR, XML_HTTP_REQUEST_SEND_ERROR,
};

use super::notifier::Notifier;

pub async fn xhr_fetch(url: String) -> Result<Vec<u8>, JsValue> {
    Notifier::xhr_request_created(&url);

    let xhr: XmlHttpRequest = XmlHttpRequest::new().map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_CREATE_ERROR}: {:?}", err).into());
        Notifier::xhr_request_error(&url);
        JsValue::from_str(XML_HTTP_REQUEST_CREATE_ERROR)
    })?;

    // Note: `no_cache` is used here to explicitly bust the network cache
    let timestamp: String = Date::now().to_string();
    let no_cache_url: String = format!("{}?no_cache={}", url, timestamp);

    xhr.open("GET", &no_cache_url).map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_OPEN_ERROR}: {:?}", err).into());
        Notifier::xhr_request_error(&url);
        JsValue::from_str(XML_HTTP_REQUEST_OPEN_ERROR)
    })?;

    Notifier::xhr_request_opened(&url);

    xhr.set_response_type(web_sys::XmlHttpRequestResponseType::Arraybuffer);

    xhr.set_request_header("Cache-Control", "no-cache")
        .map_err(|err: JsValue| {
            web_sys::console::debug_1(
                &format!("{XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR}: {:?}", err).into(),
            );
            Notifier::xhr_request_error(&url);
            JsValue::from_str(XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR)
        })?;

    xhr.send().map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_SEND_ERROR}: {:?}", err).into());
        Notifier::xhr_request_error(&url);
        JsValue::from_str(XML_HTTP_REQUEST_SEND_ERROR)
    })?;

    Notifier::xhr_request_sent(&url);

    let url_clone = url.clone();
    let promise: Promise = Promise::new(&mut |resolve, reject: js_sys::Function| {
        let url_clone_inner = url_clone.clone();
        let onload: Closure<dyn FnMut()> = Closure::wrap(Box::new(move || {
            resolve.call1(&JsValue::NULL, &JsValue::NULL).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onload(Some(onload.as_ref().unchecked_ref()));
        onload.forget();

        let onerror: Closure<dyn FnMut()> = Closure::wrap(Box::new(move || {
            reject
                .call1(&JsValue::NULL, &JsValue::from_str(FETCH_ERROR))
                .unwrap();
            Notifier::xhr_request_error(&url_clone_inner);
        }) as Box<dyn FnMut()>);
        xhr.set_onerror(Some(onerror.as_ref().unchecked_ref()));
        onerror.forget();
    });

    JsFuture::from(promise).await.map_err(|_| {
        web_sys::console::debug_1(&FETCH_ERROR.into());
        Notifier::xhr_request_error(&url);
        JsValue::from_str(FETCH_ERROR)
    })?;

    if xhr.status().unwrap() != 200 {
        let status_code: u16 = xhr.status().unwrap();
        web_sys::console::debug_1(
            &format!("Failed to load data, status code: {}", status_code).into(),
        );
        Notifier::xhr_request_error(&url);
        return Err(JsValue::from_str(&format!(
            "Failed to load data, status code: {}",
            status_code
        )));
    }

    let array_buffer: JsValue = xhr.response().unwrap();

    let buffer: Uint8Array = Uint8Array::new(&array_buffer);

    Ok(buffer.to_vec())
}

// Note: This should only be used if wishing to cache the raw content; otherwise
// it may be preferrable to cache the result of a transformation action (i.e. after
// decrypting, etc.)
pub async fn xhr_fetch_and_cache(url: String) -> Result<Vec<u8>, JsValue> {
    // Step 1: Check if the content is already cached
    if let Some(cached_future) = get_cache_future(&url) {
        // If the content is cached, return the cached data
        return cached_future.await;
    }

    // Step 2: Fetch the data using xhr_fetch if not cached
    let fetched_data = xhr_fetch(url.clone()).await.map_err(|err| {
        JsValue::from_str(&format!("Failed to fetch data: {:?}", err))
    })?;

    // Step 3: Wrap the fetched data in a future without `Send`
    let future_data = future::ready::<Result<Vec<u8>, JsValue>>(Ok(fetched_data.clone()))
        .boxed_local()  // Ensure this future is not `Send`
        .shared();

    // Step 4: Add the fetched data to the cache with the correct type
    insert_cache_future(&url, future_data);

    // Step 5: Return the fetched data
    Ok(fetched_data)
}
