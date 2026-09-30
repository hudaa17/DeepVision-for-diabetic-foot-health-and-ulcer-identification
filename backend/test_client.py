import urllib.request
import json
import time
import os

# 1. Login using OAuth2 form-encoded body
import urllib.parse
login_data = urllib.parse.urlencode({'username': 'admin@curavision.org', 'password': 'AdminSecure123!'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', data=login_data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
with urllib.request.urlopen(req) as resp:
    tokens = json.loads(resp.read().decode())
token = tokens['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('[+] Authenticated as Admin successfully')

# 2. Create patient
patient_data = json.dumps({
    'patient_code': f'DEMO-{int(time.time())}',
    'full_name': 'John Doe (Test Case)',
    'date_of_birth': '1970-01-01',
    'gender': 'male',
    'diabetes_type': 'type_2',
    'year_diagnosed': 2012
}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/patients', data=patient_data, headers={**headers, 'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    pat = json.loads(resp.read().decode())
patient_id = pat['id']
print(f"[+] Created patient: {pat['patient_code']} (ID: {patient_id})")

# 3. Upload test image
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
img_path = 'ml/dataset/test/Grade 1/112_jpg.rf.472615b206cdec5593b07c5716920e47.jpg'
if not os.path.exists(img_path):
    img_path = os.path.join('..', img_path)

with open(img_path, 'rb') as f:
    img_bytes = f.read()

body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="patient_id"\r\n\r\n{patient_id}\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="sample_foot.jpg"\r\n'
    f'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8') + img_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request('http://127.0.0.1:8000/api/v1/images/upload', data=body, headers={**headers, 'Content-Type': f'multipart/form-data; boundary={boundary}'})
with urllib.request.urlopen(req) as resp:
    img_res = json.loads(resp.read().decode())
image_id = img_res['image']['id']
print(f"[+] Uploaded clinical foot image (Image ID: {image_id})")

# 4. Trigger prediction
predict_url = f'http://127.0.0.1:8000/api/v1/predict/{image_id}?patient_id={patient_id}'
req = urllib.request.Request(predict_url, method='POST', headers=headers)
with urllib.request.urlopen(req) as resp:
    pred_res = json.loads(resp.read().decode())
pred_id = pred_res['id']
print(f"[+] Prediction pipeline initiated (Task ID: {pred_id})")

# 5. Poll for completion
for attempt in range(20):
    time.sleep(2)
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/v1/predictions/{pred_id}', headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
    status = res.get('status')
    print(f"[*] Pipeline status: {status}...")
    if status in ['completed', 'failed']:
        print('\n' + '=' * 60)
        print(' LIVE SERVER INFERENCE RESULT:')
        print('=' * 60)
        print(f"Prediction ID       : {res.get('id')}")
        print(f"Risk Classification : {res.get('risk_level')}")
        print(f"Confidence Score    : {(res.get('confidence_score') or 0) * 100:.2f}%")
        print(f"Class Breakdown     : {res.get('recommendations', {}).get('class_probabilities')}")
        print(f"Clinical Urgency    : {res.get('recommendations', {}).get('urgency')}")
        print(f"Follow-Up Window    : {res.get('recommendations', {}).get('follow_up')}")
        print(f"Grad-CAM Heatmap Key: {res.get('heatmap_storage_key')}")
        print('=' * 60)
        break
