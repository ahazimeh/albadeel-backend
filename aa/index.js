const express = require('express');
const app = express();
const port = 4000; // replace with your desired port

// your app logic here
app.get("/",(req,res) => {
    res.send({message:"sdfdf"})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});