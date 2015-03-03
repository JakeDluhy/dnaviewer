$(document).ready(function() {
	// Define an array of colors to be used for shading the graph. The colors provided
	// by d3 would group shades together, which made it difficult to differentiate on the graph.
	// These values are taken from materialpalette.com as traditional material design colors
	var colors = ['#F44336', '#2196F3', '#FF4081', '#3F51B5', '#009688', '#607D8B', '#FF5722', '#4CAF50', '#7C4DFF', '#795548', '#0097A7', '#D32F2F', '#388E3C', '#00796B', '#5D4037', '#1976D2', '#3F51B5', '#E64A19', '#C2185B', '#303F9F'];
	
	// Pull in the json fixture from the associated file. Note that this method is a very close simulation to
	// asynchronously retrieving the data from the server and displaying it. It pulls in the entire json data structure
	// and then works with the data.
	$.getJSON('../fixtures/dnamolecule.json', function(data) {
		setTitle(data.dnamoleculefile); // Set the title at the top. Normally bound in
		var dnaFeatures = sortDnaFeatures(data); // Sort the DNA features by starting position
		setupGraph(data, dnaFeatures); // Draw the graph
		setupTable(data, dnaFeatures); // Fill in the table
	});

	// Set the name of the feature to the title area of the page. Note that were this included with an Ember or Angular package 
	// this data would likely be bound in.
	// INPUT: The DNA molecule file, which contains information on the specific DNA molecule
	// OUTPUT: None. The function sets the value of the title class to the DNA molecule name, sanitized from the file format
	function setTitle(dnaFile) {
		var newTitle = dnaFile.name.replace('.'+dnaFile.format, ''); // Sanitize the name of the dnaFile by the format
		d3.select('.title').html(newTitle);
	}

	// This function satisfies two objectives: 1. Sort the DNA features by order of appearance so that the features show up nicely 
	// in the table 2. For features that lie wholly within another feature, as denoted by their starting and ending points, 
	// flag the value inside on the feature object, so that it can be displayed differently
	// INPUT: The json data retrieved from the server
	// OUTPUT: The array of dnafeatures sorted by start position and flagged for lying inside another feature
	function sortDnaFeatures(data) {
		var dnafeatures = data.dnafeatures;
		dnafeatures.sort(function(a,b) {
			//Sorting function to order the data
			if(a.start > b.start) {
				if(a.end <= b.end) {a.inside = true} // If the element is within the other element, set the inside flag on the data
				return 1;
			} else if(a.start < b.start) {
				if(b.end <= a.end) {b.inside = true} // See above
				return -1;
			} else {
				return 0;
			}
		});
		return dnafeatures;
	}

	// This is the function that takes in the dna data as well as the sorted array of dnafeatures, and sets up the graph
	// to visually display the plasmid.
	// INPUT: The data file, listed as dna and the sorted array of dnafeatures 
	// OUTPUT: None. The graph is bound to the html elements using d3 methods
	function setupGraph(dna, dnaFeatures) {
		// Define the height, width of the svg and the inner and outer radii of the ring
		var width = 550;
		var height = width;
		var innerRadius = 100;
		var outerRadius = (width-50)/2;
		// The first feature corresponds to the full gray ring that forms a background for the other components, 
		// representing the nucleotides in between the features of interest
		var features = [{start: 0, end: dna.length}].concat(dnaFeatures);
		var svg = d3.select('.graph-container').append('svg').attr('width', width).attr('height', height);
		setupGaussianFilter(svg);

		// Set up the arc path using the d3 arc helper
		var arc = d3.svg.arc()
								.innerRadius(innerRadius)
								.outerRadius(function(d) {
									//If the feature is within another, make it display half the ring
									if(d.inside) {
										return (innerRadius + outerRadius)/2;
									} else {
										return outerRadius;
									}
								})
								.startAngle(function(d) {
									return 2*Math.PI*(d.start/dna.length);
								})
								.endAngle(function(d) {
									return 2*Math.PI*(d.end/dna.length);
								});

		
		// Apply the arcs as path elements to the svg canvas. Moving them to the center and coloring them from the colors array.
		// On mouseover, mouseout, and click call functions that will apply styling to table and graph
		svg.selectAll('path')
				.data(features)
				.enter().append('path')
				.attr('d', arc)
				.attr('transform', 'translate('+width/2+','+height/2+')')
				.attr('fill', function(d,i) {
					if(i === 0) {
						return '#ddd';
					} else {
						return colors[i];
					}
				})
				.on('mouseover', function(d,i) {
					applyHoverConditions(d,i);
				})
				.on('mouseout', function(d,i) {
					removeHoverConditions(i);
				})
				.on('click', function(d,i) {
					linkToFeature(d,i);
				});
	}

	// This function takes in the dna data and the sorted array of dnaFeatures, and sets up the table using d3
	// INPUT: The data file, listed as dna and the sorted array of dnafeatures 
	// OUTPUT: None. The html table element is filled in using the data from the dnafeatures using d3 data binding
	function setupTable(dna, dnaFeatures) {
		// Concat dnafeatures to the end of a single null value. This is because the d3 data binding will register the table header
		// row as a feature and so it needs to be skipped over. This has the added benefit of syncing with the graph, which uses the first
		// index as the background element
		var features = [null].concat(dnaFeatures);

		// Append table rows to the table
		d3.select(".data-display").selectAll("tr")
			.data(features)
			.enter()
			.append("tr")
			.html(function(d,i) {
				var strand;
				// Determine whether the strand is forward or backward based off the integer value
				(d.strand === 1 ? strand = 'Forward' : strand = 'Backward');
				// Return the html of each table data element. It would probably be better to pull this out into a javascript template,
				// but for this application I decided to leave it in the text form and not mess with the templates for the interest of 
				// time and simplicity
				return "<td style='background-color:"+colors[i]+";'></td><td>"+uSub(d.dnafeature.name, false)+"</td><td>"+uSub(d.dnafeature.category.name, true)+"</td><td>"+d.start+"</td><td>"+d.end+"</td><td>"+strand+"</td><td>"+d.dnafeature.length+"</td>";
			})
			.on('mouseover', function(d,i) {
				applyHoverConditions(d,i);
			})
			.on('mouseout', function(d,i) {
				removeHoverConditions(i);
			})
			.on('click', function(d,i) {
				linkToFeature(d,i);
			});
	}

	// This function takes in the dna feature data and opens a new tab/window with the feature id as a parameter
	// Note that this is not what would be expected in a normal workflow. It is written to demonstrate the functionality that 
	// I imagine this application could display. Normally, this would link out to what I presume is /dnafeatures/:id or something
	// similar
	// INPUT: The dna feature object
	// OUTPUT: None. A new window is opened with the html page feature.html and params feature_id
	function linkToFeature(dnaFeature) {
		window.open('/feature.html?feature_id='+dnaFeature.dnafeatureId, '_blank');
	}

	// This function is called when either the table or the visual display is moused over. It will apply styling to
	// various elements, such as drop shadows, highlighting the table row, and applying the active class to the table row
	// INPUT: The dna feature data, and the object index corresponding to the array of data
	// OUTPUT: None. Various stylings are applied to the table rows and the path elements
	function applyHoverConditions(dnaFeature, objIndex) {
		var d = dnaFeature;

		if(objIndex === 0) {
			return;
		}
		// Apply a dropshadow to the path element specified by the index to make it look raised
		d3.selectAll('path').filter(function(d,i) {return i === objIndex;})
			.attr("filter", "url(#dropshadow)")
			.attr("style", "cursor: pointer;");

		// Change the html within the info container
		d3.select('.info')
			.attr('class', 'info active')
			.html(function() {
				var duration;
				(d.strand === 1 ? direction = 'Forward' : direction = 'Backward');
				// Get the symbol to display
				var symbolSrc = getFeatureSymbol(d.dnafeature.category.name);
				// Return the html to input into the info container. Again, templates may have been a better option
				return "<h4>" + uSub(d.dnafeature.name, false) + "</h4><p>"+direction+"</p><img class='"+direction.toLowerCase()+"' src='"+symbolSrc+"'>"
			});

		// Select the table row corresponding to the object index and add the active class and background color styling.
		// As a note, with Sass or Less it would probably be easy to have the same color array as a variable and reference it,
		// removing the rather ugly need to apply the background color from the JS
		d3.select('.data-display').selectAll('tr').filter(function(d,i) {return i === objIndex;})
			.attr('class', 'active')
			.attr('style', function(d,i) {
				return 'color: white; background-color:'+colors[objIndex];
			})
	}

	// This function removes the hover conditions on mouseoff.
	// INPUT: The the index of the dnafeature in the array
	// OUTPUT: None. For the most part styling is simply removed
	function removeHoverConditions(objIndex) {
		// Remove the filter, the classes, and the styling from the elements
		d3.selectAll('path').filter(function(d,i) {return i === objIndex;}).attr("filter", "");
		d3.select('.data-display').selectAll('tr').attr('class', '').attr('style', '');
	}

	// This function sets up the Gaussian filter used to apply for drop shadows
	// INPUT: The SVG set up to draw the graph on
	// OUTPUT: None. The Gaussian blur filter is setup and assigned to the id of dropshadow. This means that it is
	// now accessible to the arcs to use
	function setupGaussianFilter(svg) {
		// This was a solution sourced from Stack Overflow. I understand what is going on but could not likely reproduce
		// it without further work
		var defs = svg.append("defs");
		var filter = defs.append("filter")
	      .attr("id", "dropshadow")

	  filter.append("feGaussianBlur")
	      .attr("in", "SourceAlpha")
	      .attr("stdDeviation", 4)
	      .attr("result", "blur");
	  filter.append("feOffset")
	      .attr("in", "blur")
	      .attr("dx", 2)
	      .attr("dy", 2)
	      .attr("result", "offsetBlur");

	  var feMerge = filter.append("feMerge");

	  feMerge.append("feMergeNode")
	      .attr("in", "offsetBlur")
	  feMerge.append("feMergeNode")
	      .attr("in", "SourceGraphic");
	}

	// Sub out underscores for spaces, and optionally capitalize each word
	// INPUT: String with underscores instead of spaces, boolean on whether or not to capitalize words
	// OUTPUT: The same string with the underscores replaced by spaces, and optionally capitalized
	function uSub(val, capitalize) {
		var newVal = val.replace(new RegExp('_', 'g'), ' ');
		if (capitalize) {
			// Replaces the first letter with the capitilization of the first letter
			// Note also sourced and adapted from Stack Overflow
			return newVal.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
		} else {
			return newVal;
		}
	}

	// This function takes in the type of dnafeature, e.g. CDS or Promoter. It then takes that type and for certain features
	// returns an altered version of the SBOL symbol. For most it simply converts the type to lowercase and uses the name 
	// as the png url. Note that this works for this specific fixture, but it is possible that with different feature types
	// this would not return a correct png path. Here is where I think that for this type of application, it would be very 
	// advantageous for the backend to include the string of the relevant symbol. It would essentially eliminate the need for
	// this class.
	// INPUT: DNA Feature type
	// OUTPUT: The path to the corresponding dnafeature SBOL symbol
	function getFeatureSymbol(type) {
		if(type.toLowerCase() === 'misc_feature' || type.toLowerCase() === 'other') {
			return '/assets/sbol/user-defined.png';
		} else if(type.toLowerCase() === 'primer_bind') {
			return '/assets/sbol/primer-binding-site.png';
		} else if(type.toLowerCase() === 'rep_origin') {
			return '/assets/sbol/origin-of-replication.png';
		} else {
			return '/assets/sbol/'+type.toLowerCase()+'.png';
		}
	}
});