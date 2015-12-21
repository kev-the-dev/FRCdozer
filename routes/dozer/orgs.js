var router = require('express').Router();
var vars = require('./vars.js'),
    orgs = vars.orgs;

function findOrg(req,res,next,id) {
	if (id.match(/^[0-9a-fA-F]{24}$/)) {
		orgs.findById(id, function (err, org) {
			if (err) next(err);
			else if (!org) next("No organization found with id "+id);
			else {
				req.org = org;
				next();
			}
		});
	} else { //treat id as name;
		orgs.findOne({name:id}, function (err,org) {
			if (err) next(err);
			else if (!org) next("No organization found with id "+id);
			else {
				req.org = org;
				next();
			}
		});
	}
}
router.param('org',findOrg);

router.post('/',function (req,res) {
  if (!req.user) return res.status(401).send("Need to be logged in to create org");
  req.body.owner = req.user._id;
  orgs.create(req.body,function(err,x) {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).send(x);
  });	
});

router.route('/:org')
	.get(function (req,res){
		res.send(req.org);
	});

module.exports = router;
