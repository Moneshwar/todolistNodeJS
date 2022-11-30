const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://admin-monesh:test123@cluster0.yas9sql.mongodb.net/toDoListDB");
const itemsSchema=new mongoose.Schema(
  {
    name:String
  }
);
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item(
  {
    name:"Temp Item 1",
  }
);
const item2=new Item(
  {
    name:"Temp Item 2",
  }
);
const item3=new Item(
  {
    name:"Temp Item 3",
  }
);
const DefaultItem=[item1,item2,item3];
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.get("/",function(req,res)
{
Item.find({},function(e,datalist)
{

  if(e)
  {
    console.log(e);
  }
  else if(datalist.length==0)
  {
    Item.insertMany(DefaultItem,function(err)
    {
      res.redirect("/");
    });
  }
  else
  {
    res.render("list",{DayOfWeek:"Today",DataList:datalist});
  }
})
});
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
app.get("/:customlistName",function(req,res)
{
  const customListName=req.params.customlistName;
  console.log(customListName);
  List.findOne({name:customListName},function(err,result){
    if(!err)
    {
      if(!result)
      {
        const list=new List({
          name:customListName,
          items:DefaultItem
        })
        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        res.render("list",{DayOfWeek:customListName,DataList:result.items});
      }
    }
    else
    {
      console.log(err);
    }
  })

})
app.post("/delete",function(req,res)
{
  const checkedItem=req.body.checkbox;
  const listName=req.body.listname;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItem,function(e)  {
    if(e)
    {
      console.log(e);
    }
    else
    {
      console.log("Removed successfully");
      res.redirect("/");
    }
  })
}
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,result){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});
app.post("/",function(req,res)
{
  const itemName=req.body.enteredItem;
  const listName=req.body.listName;
  console.log(itemName);
  const item=new Item(
    {
      name:itemName,
    }
  );
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,result)
  {
    result.items.push(item)
    result.save();
    res.redirect("/"+listName);
  })
  }


});
app.listen(3000,function()
{
  console.log("Port started at 3000");
});
