import axios from "axios";
import "./style.css";

// Variable Declaration
const BASE_URL = "http://localhost:3000";

// Function Declaration
const doLogin = async (e) => {
  e.preventDefault();

  const email = document.querySelector("#formLoginEmail").value;
  const password = document.querySelector("#formLoginPassword").value;

  console.log(email, password);

  // Since this will be a Promise based operation using async/await,
  // we need to use try-catch
  try {
    // Wiring to POST /login endpoint on server
    const { data } = await axios.post(`${BASE_URL}/login`, {
      email,
      password,
    });

    console.log(data);

    // Write the data (token) to localStorage
    localStorage.setItem("token", data.data.access_token);

    // Navigate to home page
    goToHomePage();
  } catch (err) {
    console.error(err);
  }
};

const goToLogin = (e) => {
  e?.preventDefault();

  document.querySelector("#formLogin").classList.remove("hidden");
  document.querySelector("#formRegister").classList.add("hidden");
  document.querySelector("#privateRoute").classList.add("hidden");

  // Clear input values from login
  document.querySelector("#formLoginEmail").value = "";
  document.querySelector("#formLoginPassword").value = "";
};

const doRegister = async (e) => {
  e.preventDefault();

  const username = document.querySelector("#formRegisterUsername").value;
  const email = document.querySelector("#formRegisterEmail").value;
  const password = document.querySelector("#formRegisterPassword").value;

  console.log(username, email, password);

  // Since this will be a Promise based operation using async/await,
  // we need to use try-catch
  try {
    // Wiring to POST /register endpoint on server
    const { data } = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
    });

    console.log(data);

    // Navigate to login page
    goToLogin();
  } catch (err) {
    console.log(err);
  }
};

const goToRegister = (e) => {
  e?.preventDefault();

  document.querySelector("#formLogin").classList.add("hidden");
  document.querySelector("#formRegister").classList.remove("hidden");
  document.querySelector("#privateRoute").classList.add("hidden");

  // Clear input values from register
  document.querySelector("#formRegisterUsername").value = "";
  document.querySelector("#formRegisterEmail").value = "";
  document.querySelector("#formRegisterPassword").value = "";
};

// Create a function to go to home page
const goToHomePage = (e) => {
  e?.preventDefault();

  document.querySelector("#formLogin").classList.add("hidden");
  document.querySelector("#formRegister").classList.add("hidden");
  document.querySelector("#privateRoute").classList.remove("hidden");

  // When navigating to Home Page, don't forget to render it !
  renderHomePage();
};

// Create a function to doLogout
const doLogout = (e) => {
  e?.preventDefault();

  // Remove token from localStorage
  localStorage.removeItem("token");

  // Navigate to login page
  goToLogin();
};

const renderHomePage = async () => {
  // Clear #userProfile and #privateTableBody first
  document.querySelector("#userProfile").innerHTML = "";
  document.querySelector("#privateTableBody").innerHTML = "";

  // This will be a Promise based operation using async/await,
  // we need to use try-catch
  try {
    // Before fetch, we need to get the token from localStorage
    const token = localStorage.getItem("token");

    // fetch todos ("/private") from server
    const { data } = await axios.get(`${BASE_URL}/private`, {
      // We need to pass the token to the server
      // via Authorization header with Bearer token
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /*
      Response from server will be like this:
      {
        statusCode: number,
        message: string,
        data: {
          todos: Array<Todo>
          user: User
        }
      }
    */
    console.log(data);

    // Set the username to #userProfile
    document.querySelector(
      "#userProfile"
    ).innerHTML = `Hello, ${data.data.user.username}`;

    // Map todos to table rows
    const todos = data.data.todos.map((todo) => {
      return `<tr>
        <td>${todo.id}</td>
        <td><img src='${todo.image_url}' /></td>
        <td>${todo.name}</td>
        <td class="text-center">${todo.completed ? `[v]` : `[x]`}</td>
      </tr>`;
    });

    // Set todos to #privateTableBody
    document.querySelector("#privateTableBody").innerHTML = todos.join("");
  } catch (err) {
    console.log(err);
  }
};

// ?? Add new Function for addTodo
const postAddTodo = async (e) => {
  e?.preventDefault();

  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // Get the value from input
  const name = document.querySelector("#formAddTodoName").value;
  // Get input file image
  const image = document.querySelector("#formAddTodoImage").files[0];

  console.log(name, image);
};

const initialize = () => {
  // Hide #privateRoute
  document.querySelector("#privateRoute").classList.toggle("hidden");

  // Add event submit (fn doLogin) to #formLogin
  document.querySelector("#formLogin").addEventListener("submit", doLogin);

  // Hide #formRegister
  document.querySelector("#formRegister").classList.toggle("hidden");

  // Add event submit (fn doRegister) to #formRegister
  document
    .querySelector("#formRegister")
    .addEventListener("submit", doRegister);

  // Add event click (fn goToLogin) to #toLogin
  document.querySelector("#toLogin").addEventListener("click", goToLogin);

  // Add event click (fn goToRegister) to #toRegister
  document.querySelector("#toRegister").addEventListener("click", goToRegister);

  // Add event click (fn doLogout) to #doLogout
  document.querySelector("#doLogout").addEventListener("click", doLogout);

  // Add event submit (fn postAddTodo) to #formAddTodo
  document
    .querySelector("#formAddTodo")
    .addEventListener("submit", postAddTodo);
};
// End of Function Declaration

// Runner
initialize();

// Check if token exist, navigate to homepage
if (localStorage.getItem("token")) {
  goToHomePage();
}
// End of Runner
