/* START Initialization */
var entityNames = []
var regexpForTags = new RegExp("<svg[^>]*>(.*?)<\/svg>|<[^>]*>|{[^}]*}")
var regexpForJson = new RegExp("\".*\":")
var regexpForPhp = new RegExp("\'.*=>|return|<\?php")
var regexpForKeys = new RegExp(".*=")
var placeholderLeftForTags = "(!tg" //Results in: (!tg0), (!tg1) ...
var placeholderLeftForKeys = "(!ky"
var placeholderLeftForJsonKeys = "(!jn"
var placeholderLeftForPhpKeys = "(!hp"
var placeholderRight = ")"
var wordCount = 0
var regexpForOperation = new RegExp()
var placeholderLeft = ""
var placeholdersForOperation = []
/* END Initialization */

$(document).ready(function () {
  $("textarea").bind("input propertychange", function () {
    var mode = $('input[name=mode]:checked', '#mode').val()

    if ($("#remove-linebreaks").is(':checked')) {
      removeLinebreaks(this)
      console.log($(this).val())
    }

    $(".match").remove()
    placeholdersForOperation = []

    if (mode === "key") {
      regexpForOperation = regexpForTags
      placeholderLeft = placeholderLeftForTags
      ReplaceLogic(this)

      regexpForOperation = regexpForKeys
      placeholderLeft = placeholderLeftForKeys
      ReplaceLogic(this)
    }

    if (mode === "json-key") {
      regexpForOperation = regexpForJson
      placeholderLeft = placeholderLeftForJsonKeys
      ReplaceLogic(this)
    }

    if (mode === "php-key") {
      regexpForOperation = regexpForPhp
      placeholderLeft = placeholderLeftForPhpKeys
      ReplaceLogic(this)
    }

    if ($("#autocopy").is(':checked')) {
      copyText()
    }
  });

  /* START Menu buttons */
  $("#copy-text").click(function () {
    copyText()
    notify("Text copied")
  })

  $("#clear-text").click(function () {
    $("textarea")
      .focus()
      .select()
    document.execCommand("delete")
    initialize()
    notify("Text cleared")
  })
  /* END Menu buttons */

  /* START Option buttons */
  $("#autocopy").click(function () {
    notify("Auto copy toggled")
  })

  $("#remove-linebreaks").click(function () {
    notify("Line break removal toggled")
  })

  $("#tutorial").click(function () {
    $("#tutorial-container").toggle()
    notify("Tutorial toggled")
  })
  /* END Option buttons */
});

function copyText() {
  $("textarea")
    .focus()
    .select()
  document.execCommand("copy")
  notify("Elements replaced and text copied")
}

function removeLinebreaks(textarea) {
  var str = $(textarea).val()
  str = str.replace(/(\n|\r)/gm, "")
  $(textarea).val(str)
}

function notify(notification) {
  $(".notification").text(notification).stop(true, true).fadeIn().delay(5000).fadeOut()
}

function initialize() {
  entityNames = []
  wordCount = 0
  regexpForOperation = new RegExp()
  placeholdersForOperation = []
  $("#words").text(wordCount)
  $("#replacement").hide()
}

function ReplaceLogic(textarea) {
  var str = $(textarea).val()
  var index = 0
  var replacementValues = [str, index]

  if (str.search(new RegExp("\\" + placeholderLeft, "i")) > -1 && entityNames.length > 0) {
    for (var entity of entityNames) {
      var original = placeholderLeft + index + placeholderRight
      var replacement = GetEscapedEntity(entity)

      str = str.replace(new RegExp("\\" + placeholderLeft + index + "\\" + placeholderRight, "gi"), entity)
      AppendReplacementValues(original, replacement)
      index++

      if (str.indexOf(placeholderLeft) == -1) {
        break
      }
    }

    for (i = 0; i < index; i++) {
      entityNames.shift()
    }

    AppendReplacementNumber(index)
  } else {
    var replacementValues = RecursiveEntityReplacement(str, index)
    str = replacementValues[0]
    AppendReplacementNumber(replacementValues[1])
    AppendWordCountNumber(str)
  }

  $(textarea).val(str)
}

function RecursiveEntityReplacement(str, index) {
  var hasMatch = false
  var replacementValues = [str, index]

  str = str.replace(regexpForOperation, function (match) {
    var original = GetEscapedEntity(match)
    var replacement = placeholderLeft + index + placeholderRight

    AppendReplacementValues(original, replacement)
    entityNames.push(match)
    hasMatch = true
    return match
  });

  if (hasMatch) {
    str = str.replace(regexpForOperation, placeholderLeft + index + placeholderRight)
    index++

    replacementValues = RecursiveEntityReplacement(str, index)
  }

  return replacementValues
}

function AppendReplacementValues(original, replacement) {
  $("#appendReplacements").append(
    "<tr class='match'><td>" +
    original +
    "</td><td>" +
    replacement +
    "</td></tr>"
  )
  $("#replacement").show()
}

function GetEscapedEntity(entity) {
  entity = entity.replace(/</g, "&lt;")
  entity = entity.replace(/>/g, "&gt;")
  return entity;
}

function AppendReplacementNumber(number) {
  $("#replacements").text(number)
}

function AppendWordCountNumber(str) {
  var replaceStr = "/\\" + placeholderLeft + "[0-9]*\\" + placeholderRight + "/gi"

  str = str.replace(replaceStr, "")
  str = str.replace(/(^\s*)|(\s*$)/gi, "")
  str = str.replace(/[ ]{2,}/gi, " ")
  str = str.replace(/\n /, "\n")

  var wordCountNumber = str.trim().split(/\s+/).length
  $("#words").text(wordCountNumber)
}