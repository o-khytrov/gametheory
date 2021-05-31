<template>
  <div id="app">
    <ul class="nav justify-content-center">
      <li class="nav-item">
        <router-link to="/">Home</router-link>
      </li>
      <li class="nav-item">
        |<router-link to="/zero-sum">Zero-sum game</router-link>
      </li>
      <li class="nav-item">
        |<router-link to="/bimatrix">Bimatrix game</router-link>
      </li>
      <li class="nav-item">
        |<router-link to="/position">Position game</router-link>
      </li>
      <li class="nav-item">|<router-link to="/about">About</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap");

:root {
  --font: Roboto, sans-serif;
  --textColor: #374961;
  --linkActiveColor: #41b783;
}

#app {
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--textColor);

  .logo {
    width: 20%;
  }
}

.nav {
  padding: 30px 0 100px 0;

  a {
    font-weight: 500;
    color: var(--textColor);
    margin: 0 5px;
  }

  a.router-link-exact-active {
    color: var(--linkActiveColor);
  }
}

.rowmax {
  color: green !important;
  font-weight: bold !important;
}

.colmax {
  color: blue !important;
  font-weight: bold !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0;
  /* <-- Apparently some margin are still there even though it's hidden */
}

input[type="number"] {
  -moz-appearance: textfield;
  /* Firefox */
  text-align: center;
  max-width: 50px;
  border-radius: 0;
}
</style>
