const mySecret = process.env['KEYY']
console.log(mySecret)

const express = require('express');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.listen(3000, () => {
  console.log('Server running at port ', 3000);
});