<script>
  import "../../app.css";
  import { goto } from "$app/navigation";
  import escape from "lodash.escape";
  import CodeMirror from "../../CodeMirror.svelte";
  import sdk from "https://unpkg.com/@stackblitz/sdk@1/bundles/sdk.m.js";

  const browser = typeof window !== "undefined";

  let id = "";
  let creatorId = "";
  let promise = Promise.resolve([]);
  let creatorName = "Loading...";
  let isLoggedInUserTheCreator = false;

  /// Check if language is supported before using.
  function generateFilesForLanguage(lang, code) {
    if (lang === "html") {
      return { files: { "index.html": code }, mainFile: "index.html" };
    }

    let extension;
    switch (lang) {
      case "javascript":
        extension = "js";
        break;
      case "typescript":
        extension = "ts";
        break;
      case "html":
        extension = "html";
        break;
    }

    let mainFile = "index." + extension;

    let files = { "index.html": "" };
    files[mainFile] = code;

    return { files, mainFile };
  }

  function isStackBlitzAvailable(lang) {
    console.log(lang);
    return lang === "typescript" || lang === "javascript" || lang === "html";
  }

  function openInStackBlitz(code, lang, description, title) {
    if (!isStackBlitzAvailable(lang)) {
      alert("Language " + lang + " is not supported.");
      return;
    }

    let { files, mainFile } = generateFilesForLanguage(lang, code);

    sdk.openProject(
      {
        title: title,
        description: description,
        template: lang,
        files: files,
        settings: {
          compile: {
            trigger: "auto",
            clearConsole: false,
          },
        },
      },
      {
        newWindow: true,
        openFile: [mainFile],
      }
    );
  }

  function beep() {
    let sound = new Audio(
      "data:audio/x-wav;base64,UklGRnIHAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YU4HAACUuNv6///////////////pyKSAWzcVAAAAAAAAAAAAAAAAACFEaY6y1fX///////////////PTsIxnQh8AAAAAAAAAAAAAAAAAGz5ih6vP8P///////////////d27l3JNKgkAAAAAAAAAAAAAAAAUNlp/pMjp////////////////58WhfFg0EgAAAAAAAAAAAAAAAA0vUnecwOL////////////////wz6uHYj4bAAAAAAAAAAAAAAAABidKb5S42/v///////////////jYtZFsRyQEAAAAAAAAAAAAAAAAH0Jmi7DT9P///////////////+G+mnVRLQwAAAAAAAAAAAAAAAAXOV2Cp8vs////////////////6cikf1o2FAAAAAAAAAAAAAAAABAxVXmewuT////////////////y0a2JZD8dAAAAAAAAAAAAAAAACClMcJW63P3///////////////rZtpJtSSYFAAAAAAAAAAAAAAAAIENnjLHU9f///////////////+K/m3ZSLg0AAAAAAAAAAAAAAAAYOl6DqMzt////////////////6silgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5JtSSYFAAAAAAAAAAAAAAABIUNojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAADi1PcpW31/X//////////////+7QsZBwUDEVAAAAAAAAAAAAAAAVMU5siqjF4Pf////////////75cyxlXldQikTAAAAAAAAAAAACx82T2iCnLXM4fP//////////O3axq+YgGhRPCkYCgAAAAAAAQwaKz1SZ3ySp7rM2+jy+fz8+fLp3M69q5iFcV9NPS8jGhQQEBMYISs4R1doeYqbqrnF0Nje4eLf29TKv7Ollod4alxPRDs0LisrLTA2PkdSXmp3hJGcp7G5v8PGx8XCvbevpp2SiH1zaWBYUkxJRkZHSU1SWGBncHiAiZCXnaOnqqusq6mmop6YkoyGgHp0b2pnZGJhYWFjZWhrb3N3e3+DhomMjpCRkZGQj46MioiGhIKAfn18e3t6ent7fH1+fn+A"
    );
    sound.play();
  }

  async function getUser(id) {
    let response = await fetch("https://extiri.com/api/1/users/get/" + id);

    if (response.ok) {
      let text = await response.text();
      let json = JSON.parse(text);
      creatorId = json.id;
      return json.name;
    } else {
      throw response.status;
    }
  }

  async function getSnippetsDetail() {
    if (browser) {
      id = window.location.toString().split("?")[1];
      let response = await fetch("https://extiri.com/api/1/snippets/get/" + id);

      if (response.ok) {
        let text = await response.text();
        let parsed = JSON.parse(text);
        creatorName = await getUser(parsed.creator);
        checkIfCreator();
        return parsed;
      } else {
        throw response.status;
      }
    }
  }

  async function deleteSnippet() {
    if (browser) {
      id = window.location.toString().split("?")[1];
      let response = await fetch(
        "https://extiri.com/api/1/snippets/delete/" + id,
        { method: "DELETE", headers: { Authorization: "Bearer " + getToken() } }
      );

      if (response.ok) {
        alert("Snippet deleted succesfully.");
      } else {
        let text = await response.text();
        let error = JSON.parse(text);

        alert("Error: " + error.reason);
      }
    }
  }

  function getToken() {
    if (browser) {
      return localStorage.getItem("token");
    } else {
      return "";
    }
  }

  async function checkIfCreator() {
    let token = getToken();

    let response = await fetch("https://extiri.com/api/1/users/me/", {
      headers: { Authorization: "Bearer " + token },
    });

    if (response.ok) {
      let text = await response.text();
      let info = JSON.parse(text);

      if (info.id == creatorId) {
        isLoggedInUserTheCreator = true;
      } else {
        isLoggedInUserTheCreator = false;
      }
    } else {
      isLoggedInUserTheCreator = false;
    }
  }

  if (browser) {
    promise = getSnippetsDetail();
  }
</script>

<div class="main">
  <div class="navbar bg-base-300 shadow">
    <div class="flex-1">
      <a class="btn btn-ghost normal-case text-xl">Extiri</a>
    </div>
    <div class="flex-none">
      <button class="btn btn-square btn-ghost" on:click={() => goto("/")}>
        Store
      </button>
    </div>
  </div>

  <div class="sidebar">
    <div class="sidebar-content">
      {#if id !== undefined && id !== ""}
        {#await promise}
          <h1>Loading...</h1>
        {:then snippet}
          <br />

          <div class="flex justify-center items-center">
            {#if isLoggedInUserTheCreator}
              <button
                class="btn btn-error"
                on:click={() => {
                  deleteSnippet();
                }}
              >
                Delete
              </button>
            {/if}

            <button
              class="btn btn-primary ml-4"
              on:click={() => {
                navigator.clipboard.writeText(snippet.code);
                beep();
              }}
            >
              Copy
            </button>

            {#if isStackBlitzAvailable(snippet.language)}
              <button
                class="btn btn-secondary ml-4"
                on:click={() => {
                  openInStackBlitz(
                    snippet.code,
                    snippet.language,
                    snippet.desc,
                    snippet.title
                  );
                }}
              >
                Open in StackBlitz
              </button>
            {/if}
          </div>

          <br />
          <br />

          <div class="grid items-center justify-center ml-8">
            <span class="badge badge-md">{escape(snippet.language)}</span>
            <h1 class="card-title mt-3">{escape(snippet.title)}<br /></h1>
            <p class="mt-5">Creator: <b>{escape(creatorName)}</b><br /></p>
            <p>Category: <b>{escape(snippet.category)}</b></p>
            {#if escape(snippet.desc) !== ""}
              <p class="mt-5 mr-8 mb-10">{escape(snippet.desc)}</p>
            {:else}
              <p>No description</p>
            {/if}
          </div>
        {/await}
      {:else}
        <h1>Invalid ID</h1>
      {/if}
    </div>
  </div>

  <div class="details">
    <code>
      {#if id !== undefined && id !== ""}
        {#await promise}
          <h1>Loading...</h1>
        {:then snippet}
          <div class="w-screen">
            <CodeMirror language={snippet.language} code={snippet.code} />
          </div>
        {:catch error}
          <h1>{escape(error)}</h1>
          <p>
            Check whether snippets ID and URL are correct. If error repeats,
            contact the developer.
          </p>
        {/await}
      {:else}
        <h1>Invalid ID</h1>
      {/if}
    </code>
  </div>
</div>
