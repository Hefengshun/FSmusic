<template>
  <div class="music-player">
    <h1 class="title">{{ $t("message.title") }}</h1>
    <div class="action-bar">
      <div class="file-upload">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept="audio/*"
          multiple
          id="fileInput"
          class="file-input"
        />
        <label for="fileInput" class="button">{{ $t("message.upload") }}</label>
      </div>
      <button class="button" @click="selectFolder">
        {{ $t("message.selectFolder") }}
      </button>
      <button class="button" @click="removeDuplicates">
        {{ $t("message.removeDuplicates") }}
      </button>
      <button class="button" @click="clearMusicList">
        {{ $t("message.clear") }}
      </button>
    </div>
    <div class="music-list">
      <draggable
        v-model="musicList"
        @end="updateOrder"
        handle=".drag-handle"
        animation="300"
      >
        <template #item="{ element, index }">
          <div
            class="music-item"
            @mouseover="startBorderAnimation"
            @mouseout="stopBorderAnimation"
          >
            <span>{{ element.name }}</span>
            <button
              @click="playMusic(element.id)"
              :class="{
                'action-button': isPlaying && element.id === currentMusicId,
              }"
            >
              {{ $t("message.play") }}
            </button>
            <button @click="copyMusic(index)">
              {{ $t("message.copy") }}
            </button>
            <button @click="deleteMusic(index)">
              {{ $t("message.delete") }}
            </button>
            <button class="drag-handle">{{ $t("message.drag") }}</button>
          </div>
        </template>
      </draggable>
    </div>
    <audio
      ref="audioPlayer"
      class="audio-player"
      @ended="playNext"
      @play="handlePlay"
      @pause="handlePause"
      controls
    ></audio>
    <div class="language-switch">
      <select @change="setLanguage($event.target.value)">
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
    <a
      class="external-link"
      href="https://github.com/Hefengshun/FSmusic"
      target="_blank"
    >
      GitHub
    </a>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import draggable from "vuedraggable";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const musicList = ref([]);
const currentMusicId = ref(null);
const isPlaying = ref(false);
const isDragging = ref(false);
const audioPlayer = ref(null);
const fileInput = ref(null);

const handleFileUpload = (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = URL.createObjectURL(file);
    musicList.value.push({ id: uuidv4(), name: file.name, url: url });
  }
  fileInput.value.value = "";
};

const playMusic = (id) => {
  const music = musicList.value.find((item) => item.id === id);
  if (music) {
    currentMusicId.value = id;
    audioPlayer.value.src = music.url;
    audioPlayer.value.play();
  }
};

const playNext = () => {
  const currentIndex = musicList.value.findIndex(
    (item) => item.id === currentMusicId.value
  );
  if (currentIndex !== -1 && currentIndex < musicList.value.length - 1) {
    playMusic(musicList.value[currentIndex + 1].id);
  }
};

const handlePlay = () => {
  isPlaying.value = true;
};

const handlePause = () => {
  isPlaying.value = false;
};

const updateOrder = (event) => {
  // Handle the order update if necessary
};

const clearMusicList = () => {
  musicList.value = [];
  audioPlayer.value.pause();
  audioPlayer.value.src = "";
  currentMusicId.value = null;
};

const startBorderAnimation = (event) => {
  const target = event.currentTarget;
  target.classList.add("border-animation");
};

const stopBorderAnimation = (event) => {
  const target = event.currentTarget;
  target.classList.remove("border-animation");
};

const setLanguage = (lang) => {
  locale.value = lang;
};

const selectFolder = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    await scanDirectory(dirHandle);
  } catch (error) {
    console.error("Error selecting folder:", error);
  }
};

const scanDirectory = async (dirHandle) => {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "file" && entry.name.match(/\.(mp3|wav|ogg)$/i)) {
      const file = await entry.getFile();
      const url = URL.createObjectURL(file);
      musicList.value.push({ id: uuidv4(), name: file.name, url: url });
    } else if (entry.kind === "directory") {
      await scanDirectory(entry);
    }
  }
};

const removeDuplicates = () => {
  const uniqueNames = new Set();
  musicList.value = musicList.value.filter((item) => {
    if (uniqueNames.has(item.name)) {
      return false;
    } else {
      uniqueNames.add(item.name);
      return true;
    }
  });
  // 如果当前播放的音乐被移除，则停止播放
  if (!musicList.value.some((item) => item.id === currentMusicId.value)) {
    audioPlayer.value.pause();
    audioPlayer.value.src = "";
    currentMusicId.value = null;
  }
};

const copyMusic = (index) => {
  const music = musicList.value[index];
  const copiedMusic = { ...music, id: uuidv4() };
  musicList.value.splice(index + 1, 0, copiedMusic); // 插入到原始项的后面
};

const deleteMusic = (index) => {
  const music = musicList.value[index];
  if (music.id === currentMusicId.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = "";
    currentMusicId.value = null;
  }
  musicList.value.splice(index, 1);
};

const onDragStart = () => {
  isDragging.value = true;
};

const onDragEnd = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.music-player {
  max-width: 660px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 15px;
  text-shadow: 2px 2px 8px rgb(164 173 200); /* 添加字体阴影 */
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.file-upload {
  margin-right: 10px;
}

.file-input {
  display: none;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  font-size: 16px;
  color: #fff;
  background-color: #646cff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #535bf2;
}

.music-item .action-button {
  outline: 4px auto #5124e3;
}

.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  position: relative;
  transition: border-color 0.3s;
}

.music-list {
  overflow: auto;
}

.music-item span {
  width: 300px;
  text-align: left;
  padding: 0 30px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-item button {
  margin-left: 10px;
}

.drag-handle {
  cursor: grab;
}

.music-item.border-animation {
  animation: border-animation 2s linear forwards;
}

@keyframes border-animation {
  0% {
    border: 1px solid #ccc;
    box-shadow: 0 0 5px #646cff;
    border-top-color: #646cff;
    border-left-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
  }
  25% {
    border: 1px solid #ccc;
    box-shadow: 0 0 5px #646cff;
    border-top-color: #646cff;
    border-left-color: #646cff;
    border-right-color: #646cff;
    border-bottom-color: transparent;
  }
  50% {
    border: 1px solid #ccc;
    box-shadow: 0 0 5px #646cff;
    border-top-color: #646cff;
    border-left-color: #646cff;
    border-right-color: #646cff;
    border-bottom-color: #646cff;
  }
  75% {
    border: 1px solid #646cff;
    box-shadow: 0 0 5px #646cff;
    border-top-color: #646cff;
    border-left-color: #646cff;
    border-right-color: #646cff;
    border-bottom-color: #646cff;
  }
  100% {
    border: 1px solid #646cff;
    box-shadow: 0 0 5px #646cff;
  }
}

.audio-player {
  width: 100%;
  margin-top: 40px;
}

.language-switch {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.language-switch select {
  padding: 5px;
  font-size: 16px;
}

.external-link {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 85px;
  height: 30px;
  line-height: 30px;
  /* padding: 10px 20px; */
  font-size: 16px;
  color: #fff;
  background-color: #646cff;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.external-link:hover {
  background-color: #535bf2;
  text-decoration: underline;
}
</style>
