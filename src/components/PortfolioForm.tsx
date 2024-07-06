import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Space,
} from "antd";
import MockAutoComplete from "./MockAutoComplete";

const { Option } = Select;

const PortfolioForm: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Form Values: ", values);
  };
  return (
    <Form
      form={form}
      name="portfolioForm"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        remember: true,
      }}
    >
      <Space>
        <Button>Add Asset</Button>

        <MockAutoComplete />
      </Space>

      <Form.Item
        name="portfolio_name"
        label="Portfolio Name"
        rules={[{ required: true, message: "Please enter the portfolio name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="owner_name"
        label="Owner Name"
        rules={[{ required: true, message: "Please enter the owner's name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="creation_date"
        label="Creation Date"
        rules={[{ required: true, message: "Please select the creation date" }]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: false }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="stock_symbol"
        label="Stock Symbol"
        rules={[{ required: true, message: "Please enter the stock symbol" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="company_name"
        label="Company Name"
        rules={[{ required: true, message: "Please enter the company name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="purchase_date"
        label="Purchase Date"
        rules={[{ required: true, message: "Please select the purchase date" }]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item
        name="purchase_price"
        label="Purchase Price"
        rules={[{ required: true, message: "Please enter the purchase price" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: "Please enter the quantity" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="sector" label="Sector" rules={[{ required: false }]}>
        <Select>
          <Option value="technology">Technology</Option>
          <Option value="healthcare">Healthcare</Option>
          <Option value="finance">Finance</Option>
          <Option value="energy">Energy</Option>
          {/* Add more sectors as needed */}
        </Select>
      </Form.Item>

      <Form.Item name="market" label="Market" rules={[{ required: false }]}>
        <Select>
          <Option value="nyse">NYSE</Option>
          <Option value="nasdaq">NASDAQ</Option>
          {/* Add more markets as needed */}
        </Select>
      </Form.Item>

      <Form.Item
        name="current_price"
        label="Current Price"
        rules={[{ required: false }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="target_price"
        label="Target Price"
        rules={[{ required: false }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="dividend_yield"
        label="Dividend Yield"
        rules={[{ required: false }]}
      >
        <InputNumber min={0} max={1} step={0.01} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="comments" label="Comments" rules={[{ required: false }]}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PortfolioForm;
