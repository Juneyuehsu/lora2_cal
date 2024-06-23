Vue.component('lora-calculator', {
    data: function() {
        return {
            sf: 7,
            bw: 125,
            cr: '4/5',
            payload_length: 255,
            preamble_length: 8,
            tx_power: 10,
            tx_gain: 0,
            rx_gain: 0,
            frequency: 915,
            noise_figure: 5,
            ple: [],
            results: null
        }
    },
    methods: {
        calculate: function() {
            axios.post('/calculate', {
                sf: this.sf,
                bw: this.bw,
                cr: this.cr,
                payload_length: this.payload_length,
                preamble_length: this.preamble_length,
                tx_power: this.tx_power,
                tx_gain: this.tx_gain,
                rx_gain: this.rx_gain,
                frequency: this.frequency,
                noise_figure: this.noise_figure,
                ple: this.ple
            }).then(response => {
                this.results = response.data;
            }).catch(error => {
                console.error(error);
            });
        }
    },
    template: `
    <div>
        <h1>計算器</h1>
        <form @submit.prevent="calculate">
            <label>擴頻因子 (SF):</label>
            <select v-model="sf">
                <option v-for="i in 6" :value="i+6">{{ i+6 }}</option>
            </select>

            <label>頻寬 (kHz):</label>
            <input type="number" v-model="bw" />

            <label>編碼率 (CR):</label>
            <select v-model="cr">
                <option>4/5</option>
                <option>4/6</option>
                <option>4/7</option>
                <option>4/8</option>
            </select>

            <label>有效載荷長度 (字節):</label>
            <input type="number" v-model="payload_length" />

            <label>前導碼長度 (符號):</label>
            <input type="number" v-model="preamble_length" />

            <label>發射功率 (dBm):</label>
            <input type="number" v-model="tx_power" />

            <label>發射天線增益 (dB):</label>
            <input type="number" v-model="tx_gain" />

            <label>接收天線增益 (dB):</label>
            <input type="number" v-model="rx_gain" />

            <label>頻率 (MHz):</label>
            <input type="number" v-model="frequency" />

            <label>噪聲指數 (dB):</label>
            <input type="number" v-model="noise_figure" />

            <label>環境:</label>
            <div v-for="env in [{name: '自由空間', value: 2}, {name: '城市環境', value: 3}, {name: '室內環境', value: 4}, {name: '鐵皮屋', value: 5}, {name: '防爆箱', value: 6}, {name: '水泥牆', value: 6.5}, {name: '地下室', value: 7}]">
                <input type="checkbox" :value="env.value" v-model="ple" /> {{ env.name }} (PLE={{ env.value }})
            </div>

            <button type="submit">計算</button>
        </form>
        <div v-if="results">
            <h2>計算結果</h2>
            <p>有效數據速率: {{ results.effective_data_rate.toFixed(3) }} kbps</p>
            <p>空中時間: {{ results.time_on_air.toFixed(3) }} ms</p>
            <p>最大傳輸距離: {{ results.max_distance.toFixed(3) }} km</p>
            <p>接收靈敏度: {{ results.receiver_sensitivity.toFixed(2) }} dBm</p>

        <div>
            <h3>參數定義</h3>
            <p><strong>擴頻因子 (SF):</strong> LoRa的擴頻因子，範圍為6至12。</p>
            <p><strong>頻寬 (kHz):</strong> LoRa信號的頻寬，單位是千赫茲（kHz）。</p>
            <p><strong>編碼率 (CR):</strong> LoRa的前向糾錯編碼率，選項包括4/5、4/6、4/7和4/8。</p>
            <p><strong>有效載荷長度 (字節):</strong> 傳輸數據的有效載荷長度，單位是字節（Byte）。</p>
            <p><strong>前導碼長度 (符號):</strong> 傳輸前導碼的長度，單位是符號（Symbols）。</p>
            <p><strong>發射功率 (dBm):</strong> 發射信號的功率，單位是dBm。</p>
            <p><strong>發射天線增益 (dB):</strong> 發射天線的增益，單位是dB。</p>
            <p><strong>接收天線增益 (dB):</strong> 接收天線的增益，單位是dB。</p>
            <p><strong>頻率 (MHz):</strong> LoRa通信的頻率，單位是兆赫（MHz）。</p>
            <p><strong>噪聲指數 (dB):</strong> 接收機的噪聲指數，單位是dB。</p>
        </div>
        </div>
        <footer>Created by Alonso, 2024</footer>
    </div>
    `
})

new Vue({
    el: '#app'
})
