


var user = JSON.parse(document.getElementById("user").innerHTML)
console.log("testing")
console.log(user)
console.log(user.strava)





var ControlContainer = React.createClass({

    getInitialState: function() {
    return { 
      tab: 0
    };
    },

    componentDidMount: function() {

      //GET FOLLOWERS FROM STRAVA
      var component = this;
      var url = "/getallfollowers"
      $.getJSON(url, function(data) {
        console.log("received graphData")
        $(".loader").hide()
        component.setState({graphData: data})
        component.setTab0();

          //GET GEOCODED FOLLOWERS
          var url2 = "/geocode"
            $.getJSON(url2, function(data) {
            console.log("received mapData")
            component.setState({mapData: data})


          })
       

      })



      

    },

    setTab0: function() {
      this.setState({tab: 0})
    },

    setTab1: function () {
      this.setState({tab: 1})
    },

    render: function() {


       return (
          <div>
            <div className="header">
              <div className="logo">
                <img className="title-img" src="public/img/world.png"/>
                <h1 className="title"> StravaSocial </h1>
              </div>

              <h3> Social Analytics For Strava Athletes </h3>
              <img src={user.strava.details.profile} />   
            </div>

            <p className="userdata"> Hi {user.strava.details.firstname} from {user.strava.details.city} </p>

            <button className="btn btn-primary" onClick={this.setTab0}> See Your Athlete Social Network </button>
            <button className="btn btn-primary" onClick={this.setTab1}> View Your Global Follower Map </button>
            <a href="/logout" className="btn btn-primary"> Logout </a>
              
            <div className="loader">
              <p> Please wait while we load your data </p>
              <img src="public/img/loader.gif"/>
            </div>


            {this.state.tab === 0 ?
                        <SocialNetwork data={this.state.graphData} />
                        :null}
            {this.state.tab === 1 ?
                        
                        <GlobalMap data={this.state.mapData} />
                        :null}
        </div>
  );
     }  




});






var SocialNetwork = React.createClass({

    getInitialState: function() {
    return { 
      data: this.props.data,
      create: true
    };
    },

     shouldComponentUpdate: function(nextProps, nextState) {
      if (nextProps.id === this.props.id) {
        return false;
      }
      else { 
        return true; }
    }, 


    componentWillReceiveProps: function() {
      if (this.props.data && this.state.create) {
          this.appendGraph()
      }
    },

    componentDidMount: function() {
      if (this.props.data && this.state.create) {
          this.appendGraph()
      }
    },


    appendGraph: function() {
      console.log("append graph being called")
      this.setState({create: false})
      console.log(this.state.create)
      var user = this.props.data;
      var newLinks = [];
      var followers = user.strava.followers;

      //CREATE FIRST OBJ
      var followerObj = {};
      followerObj.source = user.strava.id
      followerObj.target = user.strava.id
      followerObj.name = user.strava.details.firstname
      followerObj.lastname = user.strava.details.lastname
      followerObj.img = user.strava.details.profile
      followerObj.class = "user"
      newLinks.push(followerObj)

      followers.forEach(function(follower) {


      var followerObj = {};
      followerObj.source = user.strava.id
      followerObj.target = follower.id;
      followerObj.name = follower.firstname;
      followerObj.lastname = follower.lastname
      followerObj.img = follower.profile;
      followerObj.followerNumber = follower.followerNumber;
      followerObj.country = follower.country;
      newLinks.push(followerObj)

      if (follower.followers) {
      follower.followers.forEach(function(follower2) {


      if (user.strava.followerIds.indexOf(follower2) > -1) {
      var follower2Obj = {}
      follower2Obj.source = follower.id;
      follower2Obj.target = follower2;
      follower2Obj.followerNumber = getValue(follower2, "followerNumber")
      follower2Obj.name = getValue(follower2, "firstname");
      follower2Obj.lastname = getValue(follower2, "lastname");
      follower2Obj.img = getValue(follower2, "profile");
      follower2Obj.country = getValue(follower2, "country")
      newLinks.push(follower2Obj)
      }


      });

      }





      })

      console.log(newLinks)



      function getValue (id, value) {
      var returnValue;
      followers.forEach(function(follower) {
      if (follower.id === id) {
      returnValue = follower[value]
      }
      })
      return returnValue;
      }


      var links = newLinks

      createGraph(links)



      function createGraph(data) {


      var nodes = {};

      links.forEach(function(link) {
      //USER NODE
      link.source = nodes[link.source] || (nodes[link.source] /* Names the object */  = link /* adds a property called name */);
      //FOLLOWER NODES
      link.target = nodes[link.target] || (nodes[link.target] = link);
      });


      var padding = window.innerWidth / 20;

      var width = window.innerWidth - padding*2,
      height = 900;

      d3.select("svg").remove();
      var svg = d3.select("#graph").append("svg")
      .attr("width", width)
      .attr("height", height);



      var tooltip = d3.select("#graph").append("div").attr("class", "tooltip").style("opacity", 0)





      var force = d3.layout.force()
      .nodes(d3.values(nodes)) //CREATES AN ARRAY FROM OUR OBJECT
      .links(links) 
      .size([width, height])
      .gravity(0.22)
      .linkDistance(70)
      .charge(function(d) {
      return -((d.weight * 70) +500);
      })
      .on("tick", tick) //RUNS LAYOUT ONE STEP
      .start(); //STARTS SIMULATION - NEEDS TO BE RUN WHEN LAYOUT FIRST CREATED




      var link = svg.selectAll(".link")
      .data(force.links()) 
      .enter().append("line")
      .attr("class", "link");

      var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover",  mouseover)
      .on("mouseout", mouseout)
      .call(force.drag); //MAKES IT DRAGGABLE



      node.append("circle")
      .attr("r", function(d) {
      var value = d.class === "user" ? 25 : d.weight /5 + 14
      return value
      })
      .style("fill", function(d) {
      var value = d.class === "user" ? "steelblue" : "black"
      return value
      })
      .classed("circle", true)


      //FOR USERS
      node.append("image")
      .attr('xlink:href', function(d) {

      return d.img;
      })
      .attr('class', 'profile-pic')
      .attr('height', function(d) {
      var value = d.class === "user" ? 30 : 20
      return value;
      })
      .attr('width', function(d) {
      var value = d.class === "user" ? 30 : 20
      return value;
      })

      .attr('x', function(d) {
      var value = d.class === "user" ? -15 : -10
      return value;
      })
      .attr('y', function(d) {
      var value = d.class === "user" ? -15 : -10
      return value;
      return -10
      })




      function tick() {
      link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

      node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("fill", "black")
      }


      function mouseover(d) {

      console.log(d)
      if (!d.followerNumber) {
      d.followerNumber = "Unknown"
      }

      tooltip.transition()
      .duration(200)
      .style("opacity", 0.7)
      tooltip.html("Name: " + d.name + " " + d.lastname +  "<br>Country: " + d.country + "<br>Followers: " + d.followerNumber)
      .style("left", (d3.event.pageX + 10) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");   

      }

      function mouseout(d) {
      tooltip.transition()
      .duration(200)
      .style("opacity", 0)

      }


      }

    },

    render: function() {

       return (
          <div id="graph"> </div>
  );
     }  




});


var GlobalMap = React.createClass({


     getInitialState: function() {
      
    return { 
      data: this.props.data
    };
    },

    componentDidMount: function() {
      var component = this;
     if (this.state.data){
      component.appendMap()
     }

    },

    componentDidUpdate: function() {
      this.appendMap()
    },

    appendMap: function () {
      var myFollowers = this.state.data;

  

    var width = "90%",
    height = 500;


//ADD SVG
var svg = d3.select("#globalMap").append("svg")
    .attr("width", width)
    .attr("height", height)
    .classed("map", true)


//ADD TOOLTIP
 var tooltip = d3.select("#globalMap").append("div").attr("class", "tooltip").style("opacity", 0)

//ADD PROJECTION - center and scale
var projection = d3.geo.mercator()
    .center([0, 0]) //LON (left t0 right) + LAT (up and down)
    .scale(150) //DEFAULT Is 150
    .rotate([0,0, 0]); //longitude, latitude and roll - if roll not specified - uses 0 - rotates the globe

//PATH GENERATOR USING PROJECTION
var path = d3.geo.path()
    .projection(projection);

//G AS APPENDED SVG
var g = svg.append("g");

getMap()

function getMap() {


// load and display the World
d3.json('https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-110m.json', function(json) {
  g.selectAll('path') //act on all path elements
    .data(topojson.feature(json, json.objects.countries).features) //get data
    .enter() //add to dom
    .append('path')
    .attr('fill', '#95E1D3')
    .attr('stroke', '#266D98')
    .attr('d', path)



    drawData()




});


// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 
  });

svg.call(zoom)


}



//ZOOM 



function drawData () {


  var data = myFollowers;



   var max = d3.max(data, function(d) { return d.followerNumber});
     var min = d3.min(data, function (d) { return d.followerNumber})
    console.log(max)
    console.log(min)
  var radiusScale = d3.scale.linear().domain([min, max]).range([1, 5])

    
       var circle =  g.selectAll("circle")
           .data(data)
           .enter()
           .append("circle")
          .attr('cx', function(d) { return projection([d.long,d.lat])[0] })
          .attr('cy', function(d) { return projection([d.long,d.lat])[1] })
           .attr("r", function(d) {
            return 3;
           })
           .style("fill", function(d) {

            return "black"

           })
           .style("opacity", "0.5");


circle.on("mouseover", function (d) {

  if (!d.followerNumber) {
    d.followerNumber === "Unknown"
  }

  d3.select(this).style("fill", "steelblue").style("opacity", 1).attr("r", function(d) {
    return 5;
  })

       var string = "<img class='profile-pic' style='width: 20px, height: 20px' src=" + d.profile + "/>";
      
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.8)
    tooltip.html("Name: " + d.firstname + " " + d.lastname + "<br>Followers: " + d.followerNumber + "<br>Country: " + d.country + "<br>City: " + d.city) 
        .style("left", (d3.event.pageX + 10) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
   }) 
   
circle.on("mouseout", function(d) {

  d3.select(this).style("fill", "black").style("opacity", 0.5).attr("r", function(d) {
    return 3;
  })

     tooltip.transition()
        .duration(200)
        .style("opacity", 0)
   })

   


}





    },

    render: function() {

      

       return (
          <div>
            <div id="globalMap"> </div>
        </div>
  );
     }  




});


ReactDOM.render(<ControlContainer />, document.getElementById("react-holder"));