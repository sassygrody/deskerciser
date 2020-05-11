const qs = require("querystring");
const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;
const exercises = require("./exercises");

function getRandom(list) {
  if (Array.isArray(list)) {
    return list[Math.floor(Math.random() * list.length)];
  } else {
    return list[
      Object.keys(list)[(Object.keys(list).length * Math.random()) << 0]
    ];
  }
}

function getBody(event) {
  if (event.isBase64Encoded) {
    // decode the body event from slash command
    const stringifiedBody = Buffer.from(event.body, "base64").toString("utf8");
    return qs.parse(stringifiedBody);
  } else {
    // from Slack API challange verification
    return JSON.parse(event["body"]);
  }
}

function getDeskerciseText(prompt) {
  let timerUrl = "https://www.youtube.com/watch?v=x6ggW8ei0yU";
  let description = "Do this exercise!:";
  let randomUrl;

  const exercisesForPrompt = exercises.filter(
    (exercise) => exercise.prompt === prompt
  )[0];

  if (exercisesForPrompt) {
    randomUrl = getRandom(exercisesForPrompt.urls);
    description = `Do this exercise for **${prompt}**!:`;
  } else {
    randomUrl = getRandom(getRandom(exercises).urls);
  }
  return `Timer:\n ${timerUrl}\n ${description}\n ${randomUrl}`;
}

function getCompletedText() {
  return getRandom([
    "GOOD JOB!",
    "NICE",
    "WOOHOO!",
    "That was a toughie....",
    "Great, talk to you later!"
  ]);
}

function sendDeskercise(body) {
  let response;
  const firstWordOfPrompt = body.text.toLowerCase().replace(/ .*/, "");

  if (firstWordOfPrompt === "done") {
    response = getCompletedText();
  } else {
    response = getDeskerciseText(firstWordOfPrompt);
  }

  return { response_type: "in_channel", text: response };
}

exports.handler = async (event) => {
  const body = getBody(event);

  if (body.type === "url_verification") {
    return body.challenge;
  } else if (body.token !== VERIFICATION_TOKEN) {
    return { statusCode: 401, body: "Unauthorizedddd" };
  } else {
    return sendDeskercise(body);
  }
};
