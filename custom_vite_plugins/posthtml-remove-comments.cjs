module.exports = function () {
  return function removeComments(tree) {
    tree.match({ tag: true }, (node) => {
      if (node.content) {
        node.content = node.content.filter(
          (content) =>
            typeof content !== "string" || !content.startsWith("<!--")
        );
      }
      return node;
    });
  };
};
