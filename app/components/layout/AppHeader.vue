<template>
  <header :class="headerClass">
    <AppLogo />
    <UserProfile
      :name="CURRENT_USER.name"
      :avatar="getPerson(CURRENT_USER_ID)?.avatar"
      :company="CURRENT_USER.company"
      :company-id="CURRENT_USER.companyId"
    />
  </header>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import AppLogo from "~/components/layout/AppLogo.vue";
import UserProfile from "~/components/layout/UserProfile.vue";
import { CURRENT_USER } from "~/data/constants";
import { CURRENT_USER_ID, getPerson } from "~/data/people";

const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: "0",
  h: "56px",
  px: "6",
  bg: "background.surface.bold"
});
</script>
