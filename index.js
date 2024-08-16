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

async function checkvisitedcountries()
{
    let places = [];
    const results = await db.query("SELECT country_code FROM visited_countries" );
    results.rows.forEach((element) => {
        places.push(element.country_code);
    })
    console.log(places); 
    return places;
}

app.get('/',async(req,res) => {
    const pla = await checkvisitedcountries();
    res.render("index.ejs",{vistedcountry:pla,total: pla.length});
});

app.post('/submit', async(req,res) => {
    const county = req.body["country"];
    console.log(county);
    try{
    const coun_code = await db.query("SELECT country_code FROM tour_countries WHERE LOWER(country_name) LIKE '%'|| $1 || '%';",[county.toLowerCase()]);
    const data = coun_code.rows[0];
    const newcountry = data.country_code;
    try{
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[newcountry]);
    res.redirect('/');
    }

    catch(err)
    {
        console.log(err);
        const pla = await checkvisitedcountries();
        res.render("index.ejs",{vistedcountry:pla,total: pla.length, error:"Country is already added. Please Try again!"});
    }

    }

    catch(err){
        console.log(err);
        const pla = await checkvisitedcountries();
        res.render("index.ejs",{vistedcountry:pla,total: pla.length, error:"Please enter Valid Country Name!"});
    }

});


app.listen(port,() => {
    console.log("Litsening on $(port)");
});