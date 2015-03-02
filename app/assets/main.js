$(document).ready(function() {
	var colors = ['#F44336', '#2196F3', '#FF4081', '#3F51B5', '#009688', '#607D8B', '#FF5722', '#4CAF50', '#7C4DFF', '#795548', '#0097A7', '#D32F2F', '#388E3C', '#00796B', '#5D4037', '#1976D2', '#3F51B5', '#E64A19', '#C2185B', '#303F9F'];
	// Asynchronously load in the json fixture, simulating retrieving the data from the server

	$.getJSON('../fixtures/dnamolecule.json', function(data) {
		setTitle(data.dnamoleculefile);
		var dnaFeatures = sortDnaFeatures(data);
		setupGraph(data, dnaFeatures);
		setupTable(data, dnaFeatures);
	});

	function setTitle(dnaFile) {
		var newTitle = dnaFile.name.replace('.'+dnaFile.format, '');
		d3.select('.title').html(newTitle);
	}

	function sortDnaFeatures(data) {
		var dnafeatures = data.dnafeatures;
		dnafeatures.sort(function(a,b) {
			if(a.start > b.start) {
				if(a.end <= b.end) {a.inside = true}
				return 1;
			} else if(a.start < b.start) {
				if(b.end <= a.end) {b.inside = true}
				return -1;
			} else {
				return 0;
			}
		});
		return dnafeatures;
	}

	function setupGraph(dna, dnaFeatures) {
		var width = 550;
		var height = width;
		var innerRadius = 100;
		var outerRadius = (width-50)/2;
		var features = [{start: 0, end: dna.length}].concat(dnaFeatures);
		var svg = d3.select('.graph-container').append('svg').attr('width', width).attr('height', height);
		// var colors = d3.scale.category20b();
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

		var arc = d3.svg.arc()
								.innerRadius(innerRadius)
								.outerRadius(function(d) {
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

	function setupTable(dna, dnaFeatures) {
		// Concat dnafeatures to the end of a single null value. This is because the d3 data binding will register the table header
		// row as a feature and so it needs to be skipped over
		var features = [null].concat(dnaFeatures);
		// var colors = d3.scale.category20b();

		d3.select(".data-display").selectAll("tr")
			.data(features)
			.enter()
			.append("tr")
			.html(function(d,i) {
				var strand;
				(d.strand === 1 ? strand = 'Forward' : strand = 'Backward');
				return "<td style='background-color:"+colors[i]+";'></td><td>"+uSub(d.dnafeature.name, false)+"</td><td>"+uSub(d.dnafeature.category.name, true)+"</td><td>"+d.start+"</td><td>"+d.end+"</td><td>"+strand+"</td><td>"+d.dnafeature.length+"</td>";
			})
			.attr('class', function(d) {
				if(d.hover === true) {
					return 'active';
				} else {
					return '';
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

	function linkToFeature(data, objIndex) {
		window.open('/feature.html?feature_id='+data.dnafeatureId, '_blank');
	}

	function applyHoverConditions(data, objIndex) {
		var d = data;

		if(objIndex === 0) {
			return;
		}
		d3.selectAll('path').filter(function(d,i) {return i === objIndex;})
			.attr("filter", "url(#dropshadow)")
			.attr("style", "cursor: pointer;");

		d3.select('.info')
			.attr('class', 'info active')
			.html(function() {
				var duration;
				(d.strand === 1 ? direction = 'Forward' : direction = 'Backward');
				var symbolSrc = getFeatureSymbol(d.dnafeature.category.name);
				return "<h4>" + uSub(d.dnafeature.name, false) + "</h4><p>"+direction+"</p><img class='"+direction.toLowerCase()+"' src='"+symbolSrc+"'>"
			});

		d3.select('.data-display').selectAll('tr')
			.attr('class', function(d,i) {
				if(objIndex === i) {
					return 'active';
				} else {
					return '';
				}
			})
			.attr('style', function(d,i) {
				if(objIndex === i) {
					return 'color: white; background-color:'+colors[objIndex];
				} else {
					return '';
				}
			})
	}

	function removeHoverConditions(objIndex) {
		d3.selectAll('path').filter(function(d,i) {return i === objIndex;}).attr("filter", "");
		d3.select('.data-display').selectAll('tr').attr('class', '').attr('style', '');
	}

	function uSub(val, capitalize) {
		var newVal = val.replace(new RegExp('_', 'g'), ' ');
		if (capitalize) {
			return newVal.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
		} else {
			return newVal;
		}
	}

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