const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
mongoose.connect("mongodb+srv://imsulekh:Sk9113476683@cluster0.hqd6dhv.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemsSchema = new mongoose.Schema ({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Delete this Demo List item"
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const date = require(__dirname + "/date.js");
let day = date();
var items = [];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




app.get("/",function(req, res){


  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err) console.log(err)
        else console.log("Successfully saved default items !");
      });
      res.redirect("/");
    }
    else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItems
      });
    }
  });


});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList){
          const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.post("/", function(req, res){
  //console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
//day : default port i.e, 3000
  if(listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }



});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err) console.log(err);
      else {
        console.log("Successfully deleted the checked item !");
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.listen(process.env.PORT || 3000, function(req, res){
  console.log("Server running at port 3000");
})
