/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  var project = "library";
  
  
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {  
        var queryObject = {};
        
        if (err) {
          res.json({"errorMsg": "Database connection error: get", "stackTrace": err});      
        }
        else{
          db.collection(project).find(queryObject).toArray( function(err, doc) {
            if (err) {
              res.json({"errorMsg": "Database error get", "stackTrace": err});
            }
            else {
              for(var i=0;i<doc.length;i++) {
                doc[i].commentcount = doc[i].comments.length;
                delete doc[i].comments;
              }
              res.json(doc);             
            }      
            db.close();
          });
        }
      });    
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(title == ""){
         res.json({"errorMsg": "No title was included"});
      }
      else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          var queryObject = {
            title: title,
            comments: []
          };

          if (err) {
            res.json({"errorMsg": "Database connection error: post", "stackTrace": err});      
          }
          else{
            db.collection(project).insertOne(queryObject, function(err, doc) {
              if (err) {
                res.json({"errorMsg": "Database error post", "stackTrace": err});
              }
              else {
                res.json(doc.ops[0]);

              }      
              db.close();
            });
          }
        });      
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        var queryObject = {};
        
        if (err) {
          res.json({"errorMsg": "Database connection error: delete", "stackTrace": err});      
        }
        else{
          db.collection(project).deleteMany(queryObject, function(err, doc) {
            if (err) {
              res.json({"errorMsg": "Database error delete", "stackTrace": err});
            }
            else {
              res.json({"successMsg": "complete delete successful"});
             
            }      
            db.close();
          });
        }
      });
    });
 
  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {   
        var queryObject = {
          _id : bookid.length == 24 ? ObjectId(bookid) : bookid
        }
        
        if (err) {
          res.json({"errorMsg": "Database connection error: get id", "stackTrace": err});      
        }
        else{
          db.collection(project).findOne(queryObject, function(err, doc) {
            if (err) {
              res.json({"errorMsg": "id doesn't exist", "id": bookid});
            }
            else if(doc == null || doc == undefined){
              res.json({"errorMsg": "id not found", "_id": bookid});
            }
            else {
              res.json(doc);             
            }      
            db.close();
          });
        }
      });      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var queryObject = {
          _id:  bookid.length == 24 ? ObjectId(bookid) : bookid
        }

        var update = {
          comments: comment
        }

        var setUpdate = {
          $push: update
        };        
        
        if(err) {
          console.log({"errorMsg": "Database connection error: get id", "stackTrace": err});
        } 
        else {
          db.collection(project).findOneAndUpdate(
            queryObject, setUpdate, (err, doc) => {
              if(err) {
                 res.json({"errorMsg": "couldn't update by id", "id": bookid});
              }
              else if(doc.value == null || doc.value !== undefined && doc.length > 0){
               res.json({"errorMsg": "no book exists with that id"});
              }
              else {         
                //console.log(doc);
                //console.log(doc.value);
                //console.log(bookid);
                res.json(doc.value);
              }
              db.close();
            }
          );
        }     
      }); 
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        var queryObject = {
          _id : bookid.length == 24 ? ObjectId(bookid) : bookid
        };
        
        if (err) {
          res.json({"errorMsg": "Database connection error: delete", "stackTrace": err});      
        }
        else{
          db.collection(project).deleteOne(queryObject, function(err, doc) {
            if (err) {
              res.json({"errorMsg": "Database error delete by id", "stackTrace": err});
            }
            else {
              res.json({"successMsg": "delete by id successful", _id : bookid});
             
            }      
            db.close();
          });
        }
      });
    });
  
};
