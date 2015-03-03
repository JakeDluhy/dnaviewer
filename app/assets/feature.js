$(document).ready(function() {

	// Pull in the fixture for this page. Note that in a normal scenario this would be referencing the 
	// feature by ID for additional specific information on it. In this case we must pull all the data and check
	// each entry to find it
	$.getJSON('../fixtures/dnamolecule.json', function(data) {
		var feature = getFeature(data.dnafeatures);
		setFeatureName(feature);
	});

	// This function loops through the array of dnafeatures to find the feature by ID
	// INPUT: Array of dna features
	// OUTPUT: The name of the DNA feature matching the ID in params
	function getFeature(dnaFeatures) {
		var featureId = getParameterByName('feature_id');
		for(var i=0; i < dnaFeatures.length; i++) {
			if(dnaFeatures[i].dnafeatureId == featureId) {
				return uSub(dnaFeatures[i].dnafeature.name);
			}
		}
	}

	// In a normal page flow this data would be bound in via a template. In this case set it via jquery
	// INPUT: The name of a feature
	// OUTPUT: None. Method sets the html value of the feature class to the feature name
	function setFeatureName(feature) {
		$('.feature').html(feature);
	}

	// Sub out underscores for spaces
	// INPUT: String with underscores instead of spaces
	// OUTPUT: The same string with the underscores replaced by spaces
	function uSub(val) {
		return val.replace(new RegExp('_', 'g'), ' ');
	}

	// Function sourced off Stack Overflow to take the window url and decode the params
	// INPUT: The name of a parameter needed. e.g. feature_id
	// OUTPUT: The corresponding query parameter value to that parameter name
	function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
});