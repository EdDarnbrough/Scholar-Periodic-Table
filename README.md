I had always been curious about the scope of my academic work, given I feel the area I've worked in has evolved over the years. Being a physicist (and Pokémon player in my youth) at heart I wanted to break it down to what was the range of elements I'd worked on, envisioning ticking off each one. 
I came across this trick of running some code through a bookmark as a ("bookmarklet")[https://en.wikipedia.org/wiki/Bookmarklet] while listening to a podcast and thought this was finally a way to check my element-Pokédex.

In google chrome create a bookmark, I called mine Scholar Periodic Table

Then as the url place the following code to call from GitHub:
```js

javascript:(()=>{const u="https://raw.githubusercontent.com/EdDarnbrough/Scholar-Periodic-Table/main/PeriodicTableOverlay.js?"+Date.now();fetch(u).then(r=>r.text()).then(code=>(0,eval)(code)).catch(e=>alert("Failed to load script: "+e));})();
```

Now when you click on the bookmark while on a google scholar page you will see the table pop up. If you don't see all the results you are expecting then go to the bottom of the scholar page and press "show more" then the "refresh" button on the table. It is not a very clever script and is scraping the text from the page not accessing the scholar database. 
