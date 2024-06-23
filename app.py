from flask import Flask, request, render_template, jsonify
import math

app = Flask(__name__)

def calculate_lora(sf, bw, cr, payload_length, preamble_length, tx_power, tx_gain, rx_gain, frequency, noise_figure, ple_values):
    # Calculate symbol duration (ms)
    symbol_duration = (2 ** sf) / (bw * 1000)
    
    # Calculate number of symbols
    total_symbols = preamble_length + 4.25 + 8 + max(
        math.ceil(
            (8 * payload_length - 4 * sf + 28 + 16 - 20 * (1 if cr == 1 else 0)) / (4 * (sf - 2))
        ) * (cr + 4),
        0
    )

    # Calculate total symbol duration (ms)
    total_symbol_duration = total_symbols * symbol_duration
    
    # Calculate effective data rate (kbps)
    effective_data_rate = payload_length * 8 / total_symbol_duration
    
    # Calculate receiver sensitivity (dBm)
    def calculate_receiver_sensitivity(sf, bw, nf):
        SNR = {
            6: -5,
            7: -7.5,
            8: -10,
            9: -12.5,
            10: -15,
            11: -17.5,
            12: -20
        }[sf]
        return -174 + 10 * math.log10(bw * 1000) + nf + SNR
    
    receiver_sensitivity = calculate_receiver_sensitivity(sf, bw, noise_figure)
    
    # Calculate maximum distance (km)
    ple = sum(ple_values) if ple_values else 2.0  # Default PLE value
    link_budget = tx_power + tx_gain + rx_gain - receiver_sensitivity
    max_distance = 10 ** ((link_budget - 32.45 - 20 * math.log10(frequency)) / (10 * ple))
    
    return {
        'effective_data_rate': effective_data_rate,
        'time_on_air': total_symbol_duration * 1000,
        'max_distance': max_distance,
        'receiver_sensitivity': receiver_sensitivity
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    ple_values = [float(val) for val in data['ple']]
    result = calculate_lora(
        int(data['sf']),
        float(data['bw']),
        float(data['cr'].split('/')[1]),  # 記得 cr 是 '4/5' 形式的字符串，需要拆分
        float(data['payload_length']),
        float(data['preamble_length']),
        float(data['tx_power']),
        float(data['tx_gain']),
        float(data['rx_gain']),
        float(data['frequency']),
        float(data['noise_figure']),
        ple_values
    )
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
