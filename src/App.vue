<template>
  <div>
    <nav>
      <router-link to="/">交易管理</router-link> |
      <router-link to="/summary">汇总统计</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
nav {
  padding: 12px;
  background-color: #f5f5f5;
  margin-bottom: 20px;
}
nav a {
  margin-right: 10px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}
nav a.router-link-exact-active {
  color: #42b983;
}
</style>