// PLUGIN: WIKIPEDIA
(function ( Popcorn ) {

  /**
   * Wikipedia popcorn plug-in
   * Displays a wikipedia aricle in the target specified by the user by using
   * new DOM element instead overwriting them
   * Options parameter will need a start, end, target, lang, src, title and paragraphs.
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing
   * -Target is the id of the document element that the text from the article needs to be
   * attached to, this target element must exist on the DOM
   * -Lang (optional, defaults to english) is the language in which the article is in.
   * -Src is the url of the article
   * -Title (optional) is the title of the article
   * -paragraphs (optional, defaults to 200) is  the number of words you want displaid.
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn("#video")
        .wikipedia({
          start: 5, // seconds
          end: 15, // seconds
          src: "http://en.wikipedia.org/wiki/Cape_Town",
          target: "wikidiv"
        } )
   *
   */

  let i = 1;

  let domParser = new DOMParser();
  getWiki = async function( page, lang="en" ) {
    let url = `https://${lang}.wikipedia.org/w/api.php?origin=*&action=parse&format=json&redirects&page=${page}`;
    return await fetch(url)
      .then(function(response){return response.json();})
      .then(function(response) {
        let t = response.parse.text["*"];
        // console.log(t);
        return response.parse;
    })
    .catch(function(error){console.log(error);});
  }

  Popcorn.plugin( "wikipedia" , function (options) {
  
    let newdiv,
        target = document.getElementById( options.target );
    // newdiv.style.width = "100%";
    // newdiv.style.height = "100%";

    return {

     /**
     * @member wikipedia
     * The setup function will get all of the needed
     * items in place before the start function is called.
     * This includes getting data from wikipedia, if the data
     * is not received and processed before start is called start
     * will not do anything
     */
      _setup : async function( options ) {
        // console.log("is this being run at all?");
        // declare needed variables
        // get a guid to use for the global wikicallback function
        var  _text, _guid = Popcorn.guid();
        // if the user didn't specify a language default to english
        if ( !options.lang ) {
          options.lang = "en";
        }

        // if the user didn't specify number of words to use default to 200
        options.paragraphs  = options.paragraphs || 6;
        let pageName = options.src.slice( options.src.lastIndexOf( "/" ) + 1 );
        let apiResp = await getWiki(pageName, options.lang);
        _text = apiResp.text["*"];
        // munge internal links -- hopefully catches all common uses 
        _text = _text.replace(/href=\"\/wiki\//g, `href="https://${options.lang}.wikipedia.org/wiki/`);
        _text = _text.replace(/src=\"\/\//g,`src="https://` );

        // create a container
        newdiv =  document.createElement( "div" );
        newdiv.id = "wikidiv" + i;
        i++;
        // console.log("NEWDIV");
        // console.log(newdiv);
        options._container = newdiv;
        
        // add the title. probably should be a header (!)
        options._link = document.createElement( "a" );
        options._link.setAttribute( "href", options.src );
        options._link.setAttribute( "target", "_blank" );
        // add the title of the article to the link
        options._link.innerHTML = options.title  || apiResp.title;
        // options._container.appendChild(options._link);
        options._container.innerHTML = `<h1><a href="${options.src} target="_blank">${options.title || apiResp.title}</a></h1>`;
        
        // insert the content of the wiki article
        options._container.innerHTML += _text;

        // strip these page elements from rendered html.  At present includes:
        // - editorial notes e.g. about redirects or altenrate spellings, or problems w/ page
        // - tables of ocntents, and all other tables!
        // - "Edit" links in section headers
        // - all image galleries, and other images as well
        // - empty paragraph that is for some reason usually included in output
        let removes = ['div[role="note"]', 'p.mw-empty-elt', 'table', 'div#toc', 'div.thumb', 'span.mw-editsection', 'img', 'sup.reference', 'ul.gallery'];
        for (let r of removes) {
          let note = options._container.querySelectorAll(r);
          if (note) {
            note.forEach (function (n){
              n.parentNode.removeChild(n)});
          }
        }

        // now cut down the article to n paragraphs
        let qString = `div.mw-parser-output p:nth-of-type(${options.paragraphs})`;
        
        let final = newdiv.querySelector(qString);
        // console.log(qString);
        // console.log(final);
        while (final.nextSibling) {
          //console.log(final.nextSibling);
          final.nextSibling.remove();
          
          //final = document.querySelector("#wikidiv1  div.mw-parser-output p:nth-of-type(105)")
        }
  
        // hmm.  would be better served w/ a promise or await, but works for now.  
        options._fired = true;


      },
      /**
       * @member wikipedia
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ){
        // dont do anything if the information didn't come back from wiki
        // might be better to use use `await` but I'm not yet sure if async functions
        // work for `start` and `end` in popcorn plugins
        var isReady = function () {

          if ( !options._fired ) {
            setTimeout( function () {
              isReady();
            }, 13);
          } else {

            if ( options._container ) {
              if ( document.getElementById( options.target ) ) {
                document.getElementById( options.target ).appendChild( options._container );
                // document.getElementById( options.target ).appendChild( options._desc );
                options._added = true;
              }
            }
          }
        };

        isReady();
      },
      /**
       * @member wikipedia
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ){
        // ensure that the data was actually added to the
        // DOM before removal
        if ( options._added ) {
          document.getElementById( options.target ).removeChild( options._container );
        }
      },

      _teardown: function( options ){

        if ( options._added ) {
          options._link.parentNode && document.getElementById( options.target ).removeChild( options._link );
          options._desc.parentNode && document.getElementById( options.target ).removeChild( options._desc );
          delete options.target;
        }
      }
    };
  },
    {
      about:{
        name: "Popcorn Wikipedia Plugin",
        version: "0.2",
        author: "@annasob, @titaniumbones",
        website: "annasob.wordpress.com"
      },
      options:{
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        lang: {
          elem: "input",
          type: "text",
          label: "Language",
          "default": "english",
          optional: true
        },
        src: {
          elem: "input", 
          type: "url", 
          label: "Wikipedia URL",
          "default": "http://en.wikipedia.org/wiki/Cat"
        },
        title: {
          elem: "input",
          type: "text",
          label: "Title",
          "default": "Cats",
          optional: true
        },
        paragraphs: {
          elem: "input",
          type: "number",
          label: "Number of Paragraphs",
          "default": "3",
          optional: true
        },
        target: "wikipedia-container"
      }
    });
}) ( Popcorn );
