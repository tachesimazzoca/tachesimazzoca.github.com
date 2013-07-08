(function($, _) {
  module("backbone-survey validators");

  test("ValidationResult", function() {
    var clz = BackboneSurvey.ValidationResult;
    var rslt;
    rslt = new BackboneSurvey.ValidationResult.OK();
    deepEqual(rslt.valid, true);
    ok(rslt instanceof clz);

    var str = "Error";
    rslt = new BackboneSurvey.ValidationResult.Error(str);
    ok(rslt instanceof clz);
    deepEqual(rslt.valid, false);
    deepEqual(rslt.message, str);
  });

  test("RequiredValidator", function() {
    var str = "Required";
    var validator = new BackboneSurvey.RequiredValidator({ message: str });
    ok(validator instanceof BackboneSurvey.Validator);
    _.each(["", [], {}, false, null, undefined], function(v) {
      var rslt = validator.validate(v, {});
      ok(rslt instanceof BackboneSurvey.ValidationResult.Error, "Error - " + typeof(v));
      deepEqual(rslt.message, str);
    });
    _.each([0, "0", "a"], function(v) {
      var rslt = validator.validate(v, {});
      ok(rslt instanceof BackboneSurvey.ValidationResult.OK, "OK - " + typeof(v));
    });
  });

  test("RangeLengthValidator", function() {
    var str = "Required";
    var validator = new BackboneSurvey.RangeLengthValidator({
      template: '<%- label %> must be <%- (min ? min : "") %>..<%- (max ? max : "") %> characters'
    , label: "Name"
    , min: 1
    , max: 10
    });
    ok(validator instanceof BackboneSurvey.Validator);
    var rslt;
    rslt = validator.validate("", {});
    ok(rslt instanceof BackboneSurvey.ValidationResult.Error);
    deepEqual(rslt.message, "Name must be 1..10 characters", rslt.message);
    rslt = validator.validate("01234567890", {});
    ok(rslt instanceof BackboneSurvey.ValidationResult.Error);
    deepEqual(rslt.message, "Name must be 1..10 characters", rslt.message);
    rslt = validator.validate("0123456789", {});
    ok(rslt instanceof BackboneSurvey.ValidationResult.OK);
    deepEqual(rslt.message, "", rslt.message);
  });
})(jQuery, _);
