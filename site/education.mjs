import {answerQuestion, sources} from "./guide.mjs";
import {journeys} from "./journeys.mjs";

const $ = id => document.getElementById(id);
const element = (tag, value) => {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
};
function external(label, url) {
  const link = element("a", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function showAnswer(question) {
  const result = answerQuestion(question);
  const title = element("h3", result.title);
  const references = element("ul", "");
  for (const key of result.sources) {
    const item = element("li", "");
    item.append(external(...sources[key]));
    references.append(item);
  }
  $("guide-answer").dataset.priority = result.key;
  $("guide-answer").replaceChildren(title, element("p", result.text), references);
}
$("guide-form").addEventListener("submit", event => {
  event.preventDefault();
  const question = $("guide-question").value.trim();
  if (question) showAnswer(question);
});
for (const button of document.querySelectorAll("[data-question]")) {
  button.addEventListener("click", () => {
    $("guide-question").value = button.dataset.question;
    showAnswer(button.dataset.question);
  });
}
function displayStories(filter) {
  const cards = journeys.flatMap(([name, sport, year, story, label, url, video], index) => {
    if (filter === "featured" ? index >= 5 : filter !== "all" && filter !== sport) return [];
    const article = element("article", "");
    article.className = "journey";
    article.append(element("small", sport + " · " + year), element("h3", name), element("p", story), external(label, url));
    if (video) {
      const play = element("button", "Load video here");
      play.type = "button";
      play.addEventListener("click", () => {
        const frame = document.createElement("iframe");
        frame.title = label + " · " + name;
        frame.src = "https://www.youtube-nocookie.com/embed/" + video;
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.allowFullscreen = true;
        play.replaceWith(frame);
        frame.tabIndex = 0;
        frame.focus();
      });
      article.append(play);
    }
    return [article];
  });
  $("journey-cards").replaceChildren(...cards);
}
$("journey-filter").addEventListener("change", event => displayStories(event.target.value));
displayStories($("journey-filter").value);
