$(document).ready(function() {
	$.getJSON('../fixtures/dnamolecule.json', function(data) {
		var feature = getFeature(data.dnafeatures);
		setFeatureName(feature);
	});

	function getFeature(dnaFeatures) {
		var featureId = getParameterByName('feature_id');
		for(var i=0; i < dnaFeatures.length; i++) {
			if(dnaFeatures[i].dnafeatureId == featureId) {
				return uSub(dnaFeatures[i].dnafeature.name);
			}
		}
	}

	function setFeatureName(feature) {
		$('.feature').html(feature);
	}

	function uSub(val) {
		return val.replace(new RegExp('_', 'g'), ' ');
	}

	function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
});