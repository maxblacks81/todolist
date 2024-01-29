const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
//const atlas_string_connection = "mongodb+srv://cluster0.lnuahbh.mongodb.net/ --apiVersion 1 --username blacks-admin"

// To start using EJS - Javascript Template
app.set('view engine', 'ejs')
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// DB Configuration
//mongoose.connect("mongodb+srv://cluster0.lnuahbh.mongodb.net/todolistDB --apiVersion 1 --username blacks-admin",  { useNewUrlParser: true }, { useUnifiedTopology: true });
mongoose.connect("mongodb+srv://blacks-admin:09lkpo!cn44A!@cluster0.lnuahbh.mongodb.net/todolistDB");


const itemSchema = {
    name: String
};

const listSchema = {
    name: String,
    items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);


const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit + button to add a new item"
});

const item3 = new Item({
    name: "Hit - to delete the item"
});

const defaultItems = [item1, item2, item3];


// Item.insertMany(defaultItems).then(function () {
//     console.log("Successfully saved fruits items to DB");
//   })
//   .catch(function (err) {
//     console.log(err);
// });

// Methods GET & POST
// Get Method
app.get("/", function(req, res){ 


    Item.find({}, function(err, foundItems){

        if (err){
            console.log(err);
        } else {
            if (foundItems.length === 0){
                Item.insertMany(defaultItems).then(function () {
                     console.log("Successfully saved fruits items to DB");
                }).catch(function (err) {
                   console.log(err);
                 });
                res.redirect("/");
            } else {
               res.render("list", {listTitle: "Today", newListItems: foundItems});    
            }
        }
    });
    
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList){
        if (!err){
            if (!foundList){
                //console.log("Not exists");
                const list = new List({
                    name : customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                //console.log("Exists");
                res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
            }
        }

    });

    
});

// Post Method  
app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", function(req, res){
    const chechedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(chechedItemId, function(err){
            if (!err){
                console.log("Successfully deleted checked item");
                res.redirect("/");
            }
    
        });    
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id:chechedItemId}}}, 
                            function(err, foundList){
                                if (!err){
                                    res.redirect("/" + listName);
                                }
                            });
    }

    
})

app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server listen to port 3000");
});