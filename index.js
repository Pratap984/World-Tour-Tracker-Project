import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({

    user: "postgres",
    host: "localhost",
    database: "world",
    password: "Welcome@984",
    port: 5432

});

db.connect();

//connecting database
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

async function checkvisitedcountries(uid)
{
    let places = [];
    const results = await db.query("SELECT country_code FROM visited_countries WHERE userid=$1",[uid] );
    results.rows.forEach((element) => {
        places.push(element.country_code);
    })
    console.log(places); 
    return places;
}

app.get('/',async(req,res) => {
    
    res.render("home.ejs",{passwordincorrect:""});
});

app.get("/register", (req, res) => {
    res.render("register.ejs",{error:""});
  });
  

app.post('/submit', async(req,res) => {
    // const pla = await checkvisitedcountries();
    const county = req.body["country"];
    const useid = req.body["usid"];
    const use = await db.query("SELECT name FROM customers WHERE id=$1",[useid]);
    const usename = use.rows[0].name;
    console.log(county);
    try{
    const coun_code = await db.query("SELECT country_code FROM tour_countries WHERE LOWER(country_name) LIKE '%'|| $1 || '%';",[county.toLowerCase()]);

    const data = coun_code.rows[0];
    const newcountry = data.country_code;
    try{
    const checkconuntry = await db.query("SELECT * FROM visited_countries WHERE country_code = $1 AND userid = $2",[newcountry,useid]);
    if(checkconuntry.rows.length > 0)
    {
          const pla = await checkvisitedcountries(useid);
          res.render("index.ejs",{vistedcountry:pla,total: pla.length, error:"Country is already added. Please Try again!",nameofuser:usename,uid:useid});

      
    }

    else
    {

      await db.query("INSERT INTO visited_countries (country_code,userid) VALUES ($1,$2)",[newcountry,useid]);
      const pla = await checkvisitedcountries(useid);
      res.render("index.ejs",{vistedcountry:pla,total: pla.length, error:"",nameofuser:usename,uid:useid});
    }
    
    }

    catch(err)
    {
      console.log(err);
    }

  
    }

    catch(err){
        console.log(err);
        const pla = await checkvisitedcountries(useid);
        res.render("index.ejs",{vistedcountry:pla,total: pla.length, error:"Please enter Valid Country Name!",nameofuser:usename,uid:useid});
    }

});


app.post("/register", async (req, res) => {
    
    const email = req.body.username;
    const pass =  req.body.password;
    const name1 = req.body.name;
  
    try{
  
    const checkemail = await db.query("SELECT * FROM customers WHERE email = $1",[email]);
  
    if(checkemail.rows.length > 0)
    {
      //res.send("You are already regsitred.Please try login");
      res.render("home.ejs",{passwordincorrect:"You are already regsitred.Please try login"});
    }
  
    else
    {
    await db.query("INSERT INTO customers (email,password,name) VALUES($1,$2,$3)",[email,pass,name1]);
    const usen = await db.query("SELECT id FROM customers WHERE email=$1",[email]);
    const uidn = usen.rows[0].id;
    const pla = await checkvisitedcountries(uidn);
    res.render("index.ejs",{vistedcountry:pla,total: pla.length,nameofuser:name1,uid:uidn});
    }
  }
  catch(err)
  {
    console.log(err);
  }
  
  });
  
  app.post("/login", async (req, res) => {
    
    const email = req.body.username;
    const pass =  req.body.password;
   
  
    try{
    const result = await db.query("SELECT * FROM customers WHERE email = $1",[email]);
    if(result.rows.length > 0)
      {
          const storedpass = result.rows[0].password;
          const storedname = result.rows[0].name;
          const perid = result.rows[0].id;
          const pla = await checkvisitedcountries(perid);
          if(storedpass == pass)
          {
            res.render("index.ejs",{vistedcountry:pla,total: pla.length,nameofuser:storedname,uid:perid});
          }
          else
          {
            res.render("home.ejs",{passwordincorrect:"Incorrect Password Try again"});
          }
      }
  
    else
    {
       res.render("home.ejs",{passwordincorrect:"User Not Found"});
    }
  
  }
  
  catch(err)
  {
    console.log(err);
  }
  
  });


app.listen(port,() => {
    console.log("Litsening on $(port)");
});