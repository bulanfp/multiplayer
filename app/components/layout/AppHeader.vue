<template>
  <!-- As in Pixel's enterprise layout: logo left, search centred, profile right. -->
  <header :class="headerClass">
    <div :class="css({ justifySelf: 'start', display: 'flex' })">
      <AppLogo />
    </div>
    <HeaderSearch />
    <div :class="css({ justifySelf: 'end' })">
      <UserProfile
        :name="CURRENT_USER.name"
        :avatar="getPerson(CURRENT_USER_ID)?.avatar"
        :company="CURRENT_USER.company"
        :company-id="CURRENT_USER.companyId"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import AppLogo from "~/components/layout/AppLogo.vue";
import HeaderSearch from "~/components/layout/HeaderSearch.vue";
import UserProfile from "~/components/layout/UserProfile.vue";
import { CURRENT_USER } from "~/data/constants";
import { CURRENT_USER_ID, getPerson } from "~/data/people";

const headerClass = css({
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: "4",
  flexShrink: "0",
  h: "56px",
  px: "6",
  bg: "background.surface.bold"
});
</script>
