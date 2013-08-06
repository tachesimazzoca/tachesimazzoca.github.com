/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class AnswerType
   */
  var AnswerType = function() {};
  BackboneSurvey.AnswerType = {};

  /**
   * @property NONE
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.NONE = new AnswerType();

  /**
   * @property TEXT
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.TEXT = new AnswerType();

  /**
   * @property OPTION
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.OPTION = new AnswerType();

  /**
   * @property MATRIX
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.MATRIX = new AnswerType();

  /**
   * @class QuestionType
   */
  var QuestionType = function(answerType, multiple) {
    this._answerType = answerType;
    this._multiple = multiple;
  };
  QuestionType.prototype = {
  /**
   * @method ansewrType
   * @return {AnswerType}
   */
    answerType: function() { return this._answerType; }

  /**
   * @method multiple
   * @return {Boolean}
   */
  , multiple: function() { return this._multiple; }
  };
  BackboneSurvey.QuestionType = {};

  /**
   * @property NONE
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.NONE = new QuestionType(BackboneSurvey.AnswerType.NONE, false);

  /**
   * @property TEXT
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.TEXT = new QuestionType(BackboneSurvey.AnswerType.TEXT, false);

  /**
   * @property MULTI
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MULTI = new QuestionType(BackboneSurvey.AnswerType.TEXT, true);

  /**
   * @property RADIO
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.RADIO = new QuestionType(BackboneSurvey.AnswerType.OPTION, false);

  /**
   * @property CHECKBOX
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.CHECKBOX = new QuestionType(BackboneSurvey.AnswerType.OPTION, true);

  /**
   * @property MATRIX
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MATRIX = new QuestionType(BackboneSurvey.AnswerType.MATRIX, false);

  /**
   * @property MATRIX_MULTI
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MATRIX_MULTI = new QuestionType(BackboneSurvey.AnswerType.MATRIX, true);
})();
