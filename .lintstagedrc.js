module.exports = {
  "*.ts": () => [
    "eslint {src,test}/{**,}/*.ts --fix",
    "prettier {src,test}/{**,}/*.ts --write",
  ],
};
