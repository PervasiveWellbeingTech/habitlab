const {polymer_ext} = require('libs_frontend/polymer_utils')
const screenshot_utils = require('libs_common/screenshot_utils')
var $ = require('jquery');
const {
  list_site_info_for_sites_for_which_goals_are_enabled,
  list_goals_for_site,
  get_goals,
  list_all_goals,
} = require('libs_backend/goal_utils');

const {
  get_interventions,
  get_enabled_interventions
} = require('libs_backend/intervention_utils');

polymer_ext({
  is: 'intervention-carousel',
  properties: {
    interventions: {
      type: Array,
    },
    site: {
      type: String,
      observer: 'site_changed'
    },
    uploaded_interventions: {
      type: Array,
    }
    },
    // listeners: {
    //   'modal_close': 'closeModal',
    // },
    somemethod: function() {
      // alert('somemethod called in carousel-alert')
      this.site_changed()
    },
    ready: function() {
       this.addEventListener('intervention_removed', this.somemethod);
    },
    get_list_of_uploadable: async function() {
    const [goal_info_list, intervention_name_to_info_map, enabled_interventions] = await Promise.all([
      list_goals_for_site(this.site),
      get_interventions(),
      get_enabled_interventions()
    ])
    for (let intervention_name of Object.keys(intervention_name_to_info_map)) {
      const intervention_info = intervention_name_to_info_map[intervention_name];
      intervention_info.enabled = (enabled_interventions[intervention_name] == true);
    }
    return intervention_name_to_info_map
  },
    site_changed: async function() {
      //console.log("1.11")
        // 1. Fetch shared interventions from the server
        //console.log("Fetching from the server of shared interventions from: " + this.site);
        // TODO: remove for testing
        // localStorage.setItem('local_logging_server', true) 
        if (localStorage.getItem('local_logging_server') == 'true') {
          //console.log("posting to local server")
          logging_server_url = 'http://localhost:5000/'
        } else {
          //console.log("posting to local server")
          logging_server_url = 'https://habitlab.herokuapp.com/'
        }
        let request = logging_server_url + 'get_sharedinterventions_for_site' + '?website=' + this.site;
        //console.log(request);
        let data = await fetch(request).then(x => x.json());
        //console.log(data);
        //console.log(this.interventions);


        // remove current cards
        var element = document.getElementById("cardAccess");
        while (element) {
          element.outerHTML = "";
          var a = {x : element}
          delete a.x;
          element = document.getElementById("cardAccess");
        }
        for (var i = 0; i < data.length; i++) {
          if (data[i].displayname && !localStorage['saved_intervention_' + data[i].name]) {
          this.buildProjectCard(data[i].code, data[i].name, 
                                data[i].displayname, data[i].description, 
                                data[i].domain, data[i].preview, data[i].sitename, 
                                data[i].sitename_printable, data[i].goals, 
                                data[i].stars, data[i].author_email)
          }
        }

        // upload functionality
        let modal = this.S('#myModal')[0];
        let addCard = this.S(".addCard")[0];
        let span = this.S(".close")[0];
        // console.log("-----");
        // console.log(addCard);
        // console.log(modal);
        // console.log(span);
        // console.log("-----");
        // Get the <span> element that closes the modal
        // When the user clicks the button, open the modal
        var map = await this.get_list_of_uploadable()
        var s = this.site
        //console.log(map);
        addCard.onclick = async function(event, site = s, intervention_name_to_info_map = map) {
          // modal.style.display = "block";
          //console.log(site);
          //console.log(intervention_name_to_info_map);
          // here we display a dialog
          var li = []
          var displaynames = []
          for (let intervention_name of Object.keys(intervention_name_to_info_map)) {
            if(intervention_name_to_info_map[intervention_name].sitename == site && !intervention_name_to_info_map[intervention_name].downloaded && intervention_name_to_info_map[intervention_name].custom) {
              // console.log(intervention_name_to_info_map[intervention_name])
              li.push(intervention_name_to_info_map[intervention_name])
              displaynames.push(intervention_name_to_info_map[intervention_name].displayname)
            }
          }
          //console.log(li)
          create_intervention_dialog = document.createElement('create-intervention-dialog')
          document.body.appendChild(create_intervention_dialog)
          create_intervention_dialog.intervention_list=li
          create_intervention_dialog.upload_existing_custom_intervention_dialog()
          create_intervention_dialog.addEventListener('upload_intervention', function(event) {
            console.log(event);

          })
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
          modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }

        let button = this.S(".buttonDownload");
    console.log(button)
    // button.onclick = function() {
    //   confirm("fuck!!!!")
    // }
      },
      startAdd: function() {
        this.S("#addScreen").css("display", "block");
      },
      closeModal: function() {
        this.S("#addScreen").css("display", "none");
      },
      buildProjectCard: function(code, name, displayname, description, 
        domain, preview, sitename, sitename_printable,
        goals, stars, author_email){
        let containerElement = document.querySelector(".addCard");
        //Project holder space
        let card = document.createElement('market-card');
        card.setAttribute("code", code);
        // card.setAttribute("date", date);
        card.setAttribute("name", name);
        console.log(name + " " + displayname)
        card.setAttribute("displayname", displayname);
        card.setAttribute("description", description);
        card.setAttribute("domain", domain);
        card.setAttribute("preview", preview);
        card.setAttribute("sitename", sitename);
        card.setAttribute("sitename_printable", sitename_printable);
        card.setAttribute("goals", goals);
        card.setAttribute("starCount", stars);
        card.setAttribute("author", author_email);
        card.id = "cardAccess"
        //card.addEventListener('click', this.onClick);
        //Makes sure to insert cards at the front so add button is last
        containerElement.insertAdjacentElement('afterend', card);
      },
    }, {
      source: require('libs_frontend/polymer_methods'),
      methods: [
        'S'
      ]
    }
    );
      /*{
        "name": "block_gif_links",
        "img": "source URL"
        "website":"www.reddit.com"
        "goal": "spend_less_time",
        "description": "Blocks links to gifs",
        "numusers": 200,
        "stars": 4.5,
        "comments": [
          {
            "author": "geza",
            "text": "awesome intervention"
          },
          {
            "author": "lewin",
            "text": "doubleplusgood"
          }
        ],
        "code":"NA"
      }*/





      // save_intervention: ->>
      //   self=this
      //   intervention_name = self.get_intervention_name()
      //   js_editor = this.js_editors[intervention_name]
      //   code = js_editor.getSession().getValue().trim()
      //   intervention_info = await get_intervention_info(intervention_name)
      //   display_name=intervention_name.replace new RegExp('_', 'g'), ' '
      //   new_intervention_info = {
      //     code: code
      //     name: intervention_name
      //     displayname: display_name
      //     description: intervention_info.description
      //     domain: intervention_info.domain
      //     preview: intervention_info.preview
      //     matches: [intervention_info.domain]
      //     sitename: intervention_info.sitename
      //     sitename_printable: intervention_info.sitename_printable
      //     goals: intervention_info.goals
      //     custom: true
      //   }
      //   if not (await compile_intervention_code(new_intervention_info))
      //     return false





      // let response = await fetch("");
      // let data = await response.json();
      /*this.interventions = [
        {
          name: 'foo'
        },
        {
          name: 'bar'
        }
      ]*/
      // let list = data.projects;
      //
      // for(let project of list){
      //  this.buildProjectCard(project["title"],
      //  project["description"],
      //  project["imgUrl"],
      //  project["date"],
      //  project["starCount"]);
   //},
  // buildProjectCard: function(title, description, imgUrl, date, starCount){
  //   let containerElement = document.querySelector(".container");
  //   //Project holder space
  //   let card = document.createElement('market-card');
  //   card.setAttribute("name", title);
  //   card.setAttribute("date", date);
  //   card.setAttribute("description", description);
  //   card.setAttribute("starCount", starCount);
  //   card.addEventListener('click', this.onClick);
  //   //Makes sure to insert cards at the front so add button is last
  //   containerElement.insert(card);
  // },
  // onClick: function(){
  //     //Will Open overlay view with additional info
  // }
