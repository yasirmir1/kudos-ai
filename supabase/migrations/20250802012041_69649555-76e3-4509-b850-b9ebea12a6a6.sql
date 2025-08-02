-- Clear existing cached misconception explanations again so new properly cleaned versions can be generated
DELETE FROM ai_explanations WHERE explanation_type = 'misconception';