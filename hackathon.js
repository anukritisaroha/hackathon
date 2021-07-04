const puppy=require("puppeteer");
const fs = require("fs");
const pdfkit = require('pdfkit');
var nodemailer  = require("nodemailer");

const pdfdocument = new pdfkit
pdfdocument.pipe(fs.createWriteStream("data.pdf"));  

//---- input city to go to---

let place = process.argv[2];

let allDays = [];
let alltemp = [];
let placesInfo = [];

temp()
// --- this function helps to go to weather page and find temperature of 14 days of the city we want to visit-----

async function temp(){
    let browser = await puppy.launch({
        headless: false,
        defaultViewport: false,
        slowMo: 50,
        args: ["--start-maximized"]

    });
    var tabs = await browser.pages();
    let tab = tabs[0];
    
    await tab.goto("https://www.timeanddate.com/weather/usa/california");
    await tab.waitForSelector(".picker-city__input",{visible:true});
    await tab.type(".picker-city__input",place);
    await tab.keyboard.press("Enter");
    await tab.waitForSelector("td:first-child a",{visible: true});
    await tab.click("td:first-child a");

    await tab.waitForSelector(".zebra.tb-wt.fw.tc",{visible: true});

    let days = await tab.$$(".wa .wt-dn");
    let temps = await tab.$$(".wa p");
    
    
    for(let i = 0; i<days.length;i++){
        let day = await tab.evaluate(function(ele){
            return ele.textContent;
        },days[i]);
        allDays.push(day + " July");

        let temp = await tab.evaluate(function(ele){
            return ele.textContent;
        },temps[i]);
        alltemp.push(" temperature: "+temp);
    }

   
//----storing temperatue of 14 days in pdf---
   
   pdfdocument.fontSize(19)
   pdfdocument.fillColor('black')                          
   .text("Temperature of 14 days of city to travel",{
       underline:true,
       align: "center"
   })
   pdfdocument.moveDown(1);

   for(let i=0; i<allDays.length;i++){
       let a = allDays[i];
       let b = alltemp[i];
       
       pdfdocument.fontSize(10)
       pdfdocument.font('Times-Roman'); 
       pdfdocument.text(a)
       pdfdocument.text(b)
       pdfdocument.moveDown(1);
       
       
   }
   

   pdfdocument.addPage();

    travel(tab,browser);

}
// ---this function helps us to checkout the famous places at a particular city to travel---

async function travel(tab,browser){
    await tab.goto("https://www.google.com/travel/things-to-do?dest_src=ut&tcfs&ved=2ahUKEwi5h6O9mvvvAhWwiWYCHdKBBL4QyJABegQIABAV&ictx=3");
    await tab.waitForSelector('input[placeholder="Where to? Find things to see and do"]',{visible:true});
    await tab.type('input[placeholder="Where to? Find things to see and do"]',place);
    await tab.keyboard.press("Enter");

    await tab.waitForSelector(".kQb6Eb .skFvHc.YmWhbc");
    let placesNames = await tab.$$(".kQb6Eb .skFvHc.YmWhbc");
    let totalStars = await tab.$$(".kQb6Eb .ta47le");
    
    

     for(let i = 0;i<totalStars.length;i++){
     let placeName = await tab.evaluate(function(ele){
             return ele.textContent;
         },placesNames[i]);
        placesInfo.push({"PlaceToVisit" : placeName});

     }

     pdfdocument.fontSize(19)
     pdfdocument.fillColor('black')                            
     .text("Places To Visit",{
         underline:true,
         align:"center"
     })

     //--- storing places info in pdf---

     pdfdocument.moveDown(2)
     let c1=1;
     for(let i =0; i<placesInfo.length; i++){
         let a = placesInfo[i];
         let b = a.PlaceToVisit
         pdfdocument.fontSize(10)
         pdfdocument.font('Times-Roman');  
         pdfdocument.text(c1 +". "+b);
         c1++;
     }

     pdfdocument.addPage()

     
     main(tab,browser)
}



const trip="ONEWAY"; //Select "ONEWAY" 
const sourceCity="New Delhi"; //Select the Source City(from)
const destinationCity=place; //Select the Destination City(to)
const departureDate='div[aria-label="Sun Jul 11 2021"]'; //Write Day, Month, Date, Year at the particular locations keeping other syntax as it is.
const Number_of_Adults='li[data-cy="adults-2"]'; //Select 1 or 2 or 3 or 4 or 5 or 6 or 7 or 8 or 9 or 10(for >9) 
const Number_of_Children='li[data-cy="children-2"]'; //Select 0 or 1 or 2 or 3 or 4 or 5 or 6 or 7(for >6)
const Number_of_Infants='li[data-cy="infants-0"]'; //Select 0 or 1 or 2 or 3 or 4 or 5 or 6 or 7(for >6)
const travelClass_forFlights="Economy"; //Select Economy or Premium Economy or Business

//Global Information
let obj={};
let flightHeading;
// ----this function takes us to make my trip link where we can search flights to travel to destination city from source city-----

 async function main(tab,browser)
 {

    await tab.goto("https://www.makemytrip.com");
    
 
        await flightTicketBooking(tab,browser);
 
}

// ---this function helps to book ticket and provide info of top 5 cheapest flights----

async function flightTicketBooking(tab,browser)
{
    //---Removing "Login or Create Account" Popup Box----
    
    await tab.waitForTimeout(5000);
    await tab.waitForSelector(".widgetLoader",{visible: true});
    await tab.waitForSelector(".fswTabs.latoBlack.greyText",{visible: true});
    await tab.click('li[data-cy="oneWayTrip');

    //Selecting Trip
   
     await tab.click('li[data-cy="oneWayTrip"]');
  
    
    //Entering Source City

    await tab.waitForTimeout(5000);
    await tab.waitForSelector("#fromCity",{visible: true})
    await tab.type("#fromCity",sourceCity);
    await tab.waitForTimeout(3000);
    await tab.keyboard.press("ArrowDown");                                 
    await tab.keyboard.press("Enter");

    //Entering Destination City
    
    await tab.waitForSelector(".fsw_inputBox.searchToCity.inactiveWidget.activeWidget",{visible: true})
    await tab.type(".fsw_inputBox.searchToCity.inactiveWidget.activeWidget",destinationCity);
    await tab.waitForTimeout(3000);
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    //Departure Date

    await tab.click(departureDate);
                                                                         


    //Travellers & Class
    await tab.click(".fsw_inputBox.flightTravllers.inactiveWidget");
    
    //Clicking on Number of Adults
    await tab.click(Number_of_Adults);
    
    //Clicking on Number of Children
    await tab.click(Number_of_Children);
    
    //Clicking on Number of Infants
    await tab.click(Number_of_Infants);

    //Clicking on Travel Class
    if(travelClass_forFlights=="Economy")
    {
        await tab.click('li[data-cy="travelClass-0"]');
    }
    else if(travelClass_forFlights=="Premium Economy")
    {
        await tab.click('li[data-cy="travelClass-1"]');
    }
    else
    {
        await tab.click('li[data-cy="travelClass-2"]');
    }
    
    //Clicking on Apply Button
    await tab.click(".primaryBtn.btnApply.pushRight");

    //Clicking on Search Button
    await Promise.all([
        await tab.click(".primaryBtn.font24.latoBold.widgetSearchBtn"),
        

    ])
        // ---here we are fetching details of flight---
        await new Promise(resolve => setTimeout(resolve, 10000));
        await tab.waitForSelector(".fli-list .listingCard",{visible: true});
        flightHeading="INFO";

        obj[flightHeading]=[];
        
        let listingCards=await tab.$$(".fli-list .listingCard"); 
        let len=listingCards.length;
         
        pdfdocument.fontSize(19)
        pdfdocument.text("Flights Information",{
            underline:true,
            align:"center"
        })

        pdfdocument.moveDown(2)

    

        for(let i=0;i<5;i++)
        {
            await flightInfo_ONEWAYTrip(tab,i,i);
        }
        
  
    await tab.waitForTimeout(5000);
    


// --if we decide for one way trip it will provide all details---
async function flightInfo_ONEWAYTrip(tab,i,i,len)
{
    console.log("Fetching Data.....")
    
    //Extracting "Flight Name" Information
    let FlightNameTag=await tab.$$(".boldFont.blackText.airlineName");
    let FlightName=[];
    for(let i=0;i<FlightNameTag.length;i++)
    {
        let text1=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, FlightNameTag[i]);
        FlightName.push(text1);
    }

    //Extracting "Source Time" Information
    let SourceTimeTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:first-child p:first-child");
    let SourceTime=[];
    for(let i=0;i<SourceTimeTag.length;i++)
    {
        let text2=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, SourceTimeTag[i]);
        SourceTime.push(text2);
    }

    //Extracting "Source City" Information
    let SourceCityTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:first-child p:last-child");
    let SourceCity=[];
    for(let i=0;i<SourceCityTag.length;i++)
    {
        let text3=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, SourceCityTag[i]);
        SourceCity.push(text3);
    }

    //Extracting "Total Time" Information
    let TotalTimeTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:nth-child(2) p");
    let TotalTime=[];
    for(let i=0;i<TotalTimeTag.length;i++)
    {
        let text4=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, TotalTimeTag[i]);
        TotalTime.push(text4);
    }

    //Extracting "Number Of Stops" Information
    let NumberOfStopsTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:nth-child(2) div");
    let NumberOfStops=[];
    for(let i=0;i<NumberOfStopsTag.length;i++)
    {
        let text5=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, NumberOfStopsTag[i]);
        NumberOfStops.push(text5);
    }

    //Extracting "Destination Time" Information
    let DestinationTimeTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:nth-child(3) p:first-child");
    let DestinationTime=[];
    for(let i=0;i<DestinationTimeTag.length;i++)
    {
        let text6=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, DestinationTimeTag[i]);
        DestinationTime.push(text6);
    }

    //Extracting "Destination City" Information
    let DestinationCityTag=await tab.$$(".makeFlex.spaceBtwCenter.textCenter.fontSize12 div:nth-child(3) p:last-child");
    let DestinationCity=[];
    for(let i=0;i<DestinationCityTag.length;i++)
    {
        let text7=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, DestinationCityTag[i]);
        DestinationCity.push(text7);
    }

    //Extracting "Flight Ticket Price" Information
    let FlightTicketPriceTag=await tab.$$(".priceSection .blackText.fontSize18.blackFont");
    let FlightTicketPrice=[];
    for(let i=0;i<FlightTicketPriceTag.length;i++)
    {
        let text8=await tab.evaluate(function(ele) {
            return ele.textContent;
        }, FlightTicketPriceTag[i]);
        FlightTicketPrice.push(text8);
    }
    
    
        let obj11={};
        obj11["Flight_Name"]=FlightName[i];
        obj11["Source_Time"]=SourceTime[i+i];
        obj11["Source_City"]=SourceCity[i];
        obj11["Total_Time"]=TotalTime[i+i+i];
        obj11["Number_Of_Stops"]=NumberOfStops[i+i];
        obj11["Destination_Time"]=DestinationTime[i];
        obj11["Destination_City"]=DestinationCity[i];
        obj11["Flight_Ticket_Price"]=FlightTicketPrice[i];
        obj[flightHeading].push(obj11);

        
}



pdf();
// --in this function we are storing all flights details in pdf---
async function pdf(){
        
    var data = obj.INFO
    var data1 = data.map(data => {
    // Flight name
      pdfdocument.font('Times-Roman');                 
      pdfdocument.fontSize(12);                        
  
     
      pdfdocument.fillColor('black')                             
          .text("Flight Name: ",{
              underline:true,
              continued:true
          }).fillColor('#1B1464')
          .text(data.Flight_Name,{
              underline:false
          })

        // Source time
        pdfdocument.font('Times-Roman');                 
        pdfdocument.fontSize(12);                       
    
        
        pdfdocument.fillColor('black')                             
            .text("Source Time: ",{
                underline:true,
                continued:true
            }).fillColor('#1B1464')
            .text(data.Source_Time,{
                underline:false
            })

        //! Source city
        pdfdocument.font('Times-Roman');                 
        pdfdocument.fontSize(12);                        
    
        
        pdfdocument.fillColor('black')                             
            .text("Source City: ",{
                underline:true,
                continued:true
            }).fillColor('#1B1464')
            .text(data.Source_City,{
                underline:false
            })

//! total time
        pdfdocument.font('Times-Roman');                 
        pdfdocument.fontSize(12);                        
    
        
        pdfdocument.fillColor('black')                            
            .text("Total Time: ",{
                underline:true,
                continued:true
            }).fillColor('#1B1464')
            .text(data.Total_Time,{
                underline:false
            })


            //! no. of stops 

            pdfdocument.font('Times-Roman');                 
            pdfdocument.fontSize(12);                        
        
            
            pdfdocument.fillColor('black')                             
                .text("Number Of Stops: ",{
                    underline:true,
                    continued:true
                }).fillColor('#1B1464')
                .text(data.Number_Of_Stops,{
                    underline:false
                })

            //! destination time

            pdfdocument.font('Times-Roman');                 
            pdfdocument.fontSize(12);                        
        
           
            pdfdocument.fillColor('black')                             
                .text("Destination Time: ",{
                    underline:true,
                    continued:true
                }).fillColor('#1B1464')
                .text(data.Destination_Time,{
                    underline:false
                })

            //! destination city

            pdfdocument.font('Times-Roman');                
            pdfdocument.fontSize(12);                        
        
            
            pdfdocument.fillColor('black')                             
                .text("Destination City: ",{
                    underline:true,
                    continued:true
                }).fillColor('#1B1464')
                .text(data.Destination_City,{
                    underline:false
                })

            //!flight ticket price

            pdfdocument.font('Times-Roman');                 
            pdfdocument.fontSize(12);                        
        
           // pdfdocument.moveDown(1);
            pdfdocument.fillColor('black')                            
                .text("Flight Ticket Price: ",{
                    underline:true,
                    continued:true
                }).fillColor('#1B1464')
                .text(data.Flight_Ticket_Price,{
                    underline:false
                })


            pdfdocument.moveDown(1);


    });

      
    }




    // ---here we will get a link to book flights in pdf
    let BookingpageLink = await tab.url();
    pdfdocument.moveDown(2)
    await pdfdocument.fontSize(20)
    .fillColor('red')
    .text('Click To Book Your Flight', 20, 0, {
    link: BookingpageLink,
    underline: true,
    }
    );
   
    await pdfdocument.end()
    // --at end after all work it will show on console pdf generated---
    console.log("pdf generated");
   

    var tour= nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'anukritisaroha45@gmail.com',
          pass: 'Akkumatu1*'
        }
      });
      
      var mailOptions = {
        from: 'anukritisaroha45@gmail.com',
        to: 'anukritisaroha123@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'Tour data',
        attachments: [
          {
              filename: 'data.pdf',
              path:"data.pdf"                                         
          }]
    
      };
      
      tour.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}




