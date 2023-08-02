const express   = require('express');
const app       = express();
const database  = require('./database');
const mongoose = require('mongoose');
const book = require('./Schema/Book');
const AuthorModal = require('./Schema/Author');


      // Connection of MongoDB Database
mongoose.connect("mongodb://localhost:27017/bookAPI2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log("Connection established with database");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});




app.use(express.json());

    // Serving on 3000 port //
    app.listen(3000,()=>{
      console.log("listening to port 3000");
    })
        /*////////////////////////////////// GET Commands //////////////////////////////// */
    // root Route
    app.get('/',function(req,res){
    res.send("BookAPI project");   
    })

    // - to get all books
    app.get('/book',function(req,res){
        return res.json({books:database.Book});
    })
    // to get all authors
    app.get('/author',(req,res)=>{{
      return res.json(database.Author);
    }});

    // to get all publication
    app.get('/publication',(req,res)=>{
      return res.json(database.Publication);
    })

    // - to get book by specific book ID
    app.get('/book/:bookID', async(req, res) => {
      const getSpecifiedBook = await book.findOne({ISBN:req.params.bookID});
      return res.json({ book: getSpecifiedBook });
    });

    // to get a list of books based on category
    app.get('/book/c/:category',(req,res)=>{

      const getCategory = database.Book.filter((book) => 
      book.category.includes
      (req.params.category));
      
      if (getCategory.length === 0) {
        return res.json({ error: 'Book with this category not found' });
      }  
      return res.json({ book: getCategory });

    


    })

  // - to get a list of books based on author 
    app.get('/book/author/:authorID',(req,res)=>{
      
      const authorID=req.params.authorID
      const author = database.Book.filter((book) => book.authors.includes(parseInt(authorID)));
      

      if(author.length===0){

        return res.json({error:'author not found'});
      
      }

      return res.json({author:author})
    })
    
    // get  book from publication from its id 
    app.get("/book/publication/p/:PublicationID", (req, res) => {
      const pub=req.params.PublicationID;
      console.log(pub);
      const data=database.Book.filter((book)=>book.publication.toString()===pub)
       return res.json({publication : data});
      }
    )
    
        /*////////////////////////////////// POST Commands //////////////////////////////// */
    // to add new book 
    app.post('/book/new', async(req,res)=>{
      
      try {

        const {newBook}= req.body;

        await book.create(newBook);
        return res.json({message:"Book added to the database"});

      } catch (error) {
        res.json({message:error.message});
      }
    })

    // add new Author
    app.post('/author/new', async(req,res)=>{
      try {  
      const {newAuthor}=req.body;
      // restructuring of data 
      console.log(newAuthor);
      await AuthorModal.create(newAuthor)
      res.json({message: "Author added successful"});
      
      } 
      catch (error) {
              res.json({message:error.message});
      }
    })

    // add new Publication
    app.post('/publication/new',(req,res)=>{
      
      const {newPublication}=req.body;
      // restructuring of data 
      console.log(newPublication);
      database.Publication.push(newPublication);

      res.json(database.Publication);
    })


    /*////////////////////////////////// PUT commands //////////////////////////////// */
    
    // to update book details 
    app.put("/book/update/:isbn",(req,res)=>{
        const {updatedBook}= req.body;
        const {isbn}=req.params;

        const book = database.Book.map((book)=>{
          if(book.ISBN===isbn){
            console.log({...updatedBook})
            return{...book,...updatedBook};
          }
          
          return book;
        })
      return res.json(book);
    })
    // to update/add new author
    app.put("/book/author/update/:id",(req,res)=>{
      const {id}=req.params;
      const {updatedAuth} = req.body;

      const author= database.Author.map((auth)=>{
        if(auth.id.toString()===id){

          return {...auth,...updatedAuth};
        }
        console.log(auth,updatedAuth);
        return auth;
      })
    return res.json(author);
    })

    // update publication by ID
    app.put("/book/publication/update/:id",(req,res)=>{
        const {id}=req.params;
        const {publicationBody}=req.body;

        const UpdatePublication= database.Publication.map((public)=>{
          if(public.id.toString()===id)
          {
            return {...public,...publicationBody};
          }
          return public; 
        })
        return res.json(UpdatePublication);
    })



  /*////////////////////////////////// DELETE commands //////////////////////////////// */

  app.delete("/book/delete/:ISBN",(req,res)=>{
    const {ISBN}= req.params;
    const FilteredBooks= database.Book.filter((book)=>
    {
     return book.ISBN!==ISBN;
    });

    return res.json(FilteredBooks);


  })

  // delete any author
  app.delete("/author/delete/:id",(req,res)=>{
    const {id}=req.params;
    const FilterAuthors= database.Author.filter((author)=>{
      return author.id.toString()!==id
    })
    return res.json(FilterAuthors)
  })

  // delete any publisher
  app.delete("/publication/delete/:id",(req,res)=>{
    const {id}=req.params;
    const FilterPublication= database.Publication.filter((publisher)=>{
      return publisher.id.toString()!==id
    })
    return res.json(FilterPublication)
  })


  app.delete("/book/author/delete/:id", (req, res) => {
    const { id } = req.params;
  
    // Iterate through each book in the database.Book array
      database.Book.forEach((book) => {
      // Check if the book has the author's ID in its authors array
      if (book.authors.includes(parseInt(id))) {
        // Filter out the author's ID from the authors array
        book.authors = book.authors.filter((authorId) => authorId !== parseInt(id));
      }
    });
  
    console.log(database.Book);
    return res.json(database.Book);
  });
  app.delete("/book/category/delete/:id",(req,res)=>{

    const {id}=req.params;

    console.log(id)
    database.Book.forEach((book)=>{

      if(book.category.includes(id))
      {
        book.category=book.category.filter((categoryId)=>categoryId!==id);
      }
    })
      return res.json(database.Book);
  })
