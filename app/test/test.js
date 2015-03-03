// Pull in comparison data
var dna = require('../fixtures/dnamolecule.json');
var moleculeName = dna.dnamoleculefile.name.replace('.'+dna.dnamoleculefile.format, '');
var dnafeatures = dna.dnafeatures;
dnafeatures.sort(function(a,b) {
  //Sorting function to order the data
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
var featureNumber = dnafeatures.length;
var firstFeatureName = dnafeatures[0].dnafeature.name.replace(new RegExp('_', 'g'), ' ');
var firstFeatureType = dnafeatures[0].dnafeature.category.name.replace(new RegExp('_', 'g'), ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
var firstFeatureStart = dnafeatures[0].start;
var firstFeatureEnd = dnafeatures[0].end;
var firstFeatureDirection = (dnafeatures[0].strand === 1 ? 'Forward' : 'Backward');
var firstFeatureSize = dnafeatures[0].dnafeature.length;

casper.test.begin('D3 properly pulls in the json files', 10, function suite(test) {
  casper.start("http://localhost:3300", function() {
    test.assertTitle("DNA Viewer", "DNA Viewer is expected title");

    test.assertEval(function(name) {
      return __utils__.findOne('.title').textContent === name;
    }, 'Molecule Name is properly loaded in', {'name': moleculeName});

    test.assertEval(function(featureNumber) {
      return __utils__.findAll('.data-display tr').length === featureNumber+1;
    }, 'All of the features are pulled in to the table', {'featureNumber': featureNumber});

    test.assertEval(function(featureNumber) {
      return __utils__.findAll('.graph-container path').length === featureNumber+1;
    }, 'All of the features are created as path objects', {'featureNumber': featureNumber});

    test.assertEval(function(name) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(2)').textContent === name;
    }, 'The first feature name is properly loaded into the table', {'name': firstFeatureName});

    test.assertEval(function(type) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(3)').textContent === type;
    }, 'The first feature type is properly loaded into the table', {'type': firstFeatureType});

    test.assertEval(function(start) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(4)').textContent == start;
    }, 'The first feature start value is properly loaded into the table', {'start': firstFeatureStart});

    test.assertEval(function(end) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(5)').textContent == end;
    }, 'The first feature end value is properly loaded into the table', {'end': firstFeatureEnd});

    test.assertEval(function(direction) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(6)').textContent == direction;
    }, 'The first feature start value is properly loaded into the table', {'direction': firstFeatureDirection});

    test.assertEval(function(size) {
      return __utils__.findOne('tr:nth-child(2) td:nth-child(7)').textContent == size;
    }, 'The first feature size value is properly loaded into the table', {'size': firstFeatureSize});

  });

  casper.run(function() {
    test.done();
  });
});