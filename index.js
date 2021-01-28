//DOM elements
const btns = document.querySelectorAll("button");
const form = document.querySelector("form");
const formAct = document.querySelector("form span");
const input = document.querySelector("input");
const error = document.querySelector(".error");

let activity = "cycling";
btns.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    activity = e.target.dataset.activity;
    formAct.textContent = activity;
    btns.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    update(data);
  })
);

//form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const distance = parseInt(input.value);
  let doc = { name: activity, distance, date: new Date().toString() };
  if (distance) {
    db.collection("workout")
      .add(doc)
      .then(() => {
        error.textContent = "";
        form.reset();
      });
  } else {
    error.textContent = "Please enter a numeric value";
  }
});
