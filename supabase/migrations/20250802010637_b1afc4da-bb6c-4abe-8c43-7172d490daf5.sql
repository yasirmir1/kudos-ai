-- Clear existing cached misconception explanations so new cleaned versions can be generated
DELETE FROM ai_explanations WHERE explanation_type = 'misconception';