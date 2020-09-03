//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema = {name: String};
const listSchema = {name: String, items:[itemsSchema]};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({name: "Welcome to your ToDo list!"});
const item2 = new Item({name: "<--Click this to delete an item."});
const item3 = new Item({name: "Click + to insert an item."});

const defaultItems =[item1, item2, item3];

app.get("/", function(req, res) {
  Item.find({}, function(err, results){
    if(results.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
          } else{
          console.log("Added default items to the database.");
          }
      });
      res.redirect("/");
     }
    else{
    res.render("list", {listTitle: "Today", newListItems: results});
  }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, results){
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
if(listName == "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){console.log(err);}
    else{
      console.log("One Item Removed!");
      res.redirect("/");
    }
  });
} else {
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err)
        res.redirect("/" + listName);
    });
}

});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:paramName", function(req, res){
  const paramName = _.capitalize(req.params.paramName);

  List.findOne({name: paramName}, function(err, results){
    if(!err){
      if(!results){
        const list = new List({
          name: paramName,
          items: defaultItems
      });
    list.save();
    res.redirect("/" + paramName);
  }
      else{ res.render("list", {listTitle: results.name, newListItems: results.items});
    }
  }
  });
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
