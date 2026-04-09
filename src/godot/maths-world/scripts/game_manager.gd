# Classmates — HighlandAI
# © 2026 John McMillan (HighlandAI). All rights reserved.
# Licensed under CC BY-NC 4.0

extends Node

## Maths World — proof-of-concept 3D maths game
## Player walks around a room, approaches question pedestals,
## selects the correct answer from floating orbs.

signal question_answered(correct: bool)
signal game_finished(score: int, total: int, stars: int)

var questions: Array[Dictionary] = []
var current_question: int = 0
var score: int = 0
var total: int = 10
var streak: int = 0
var best_streak: int = 0

func _ready() -> void:
	_generate_questions()

func _generate_questions() -> void:
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	questions.clear()
	for i in range(total):
		var q = _make_question(rng, i)
		questions.append(q)

func _make_question(rng: RandomNumberGenerator, difficulty: int) -> Dictionary:
	var ops = ["+", "-", "×"]
	var op = ops[rng.randi_range(0, 2)]
	var a: int
	var b: int
	var answer: int

	match op:
		"+":
			a = rng.randi_range(1, 20 + difficulty * 5)
			b = rng.randi_range(1, 20 + difficulty * 5)
			answer = a + b
		"-":
			a = rng.randi_range(5, 30 + difficulty * 5)
			b = rng.randi_range(1, a)
			answer = a - b
		"×":
			a = rng.randi_range(2, 6 + difficulty)
			b = rng.randi_range(2, 6 + difficulty)
			answer = a * b

	var prompt = "%d %s %d = ?" % [a, op, b]

	# Generate 3 wrong answers
	var options = [answer]
	while options.size() < 4:
		var wrong = answer + rng.randi_range(-10, 10)
		if wrong != answer and wrong > 0 and not options.has(wrong):
			options.append(wrong)
	options.shuffle()

	return {
		"prompt": prompt,
		"answer": answer,
		"options": options
	}

func get_current_question() -> Dictionary:
	if current_question < questions.size():
		return questions[current_question]
	return {}

func submit_answer(selected: int) -> bool:
	var q = get_current_question()
	var correct = selected == q["answer"]
	if correct:
		score += 1
		streak += 1
		if streak > best_streak:
			best_streak = streak
	else:
		streak = 0
	current_question += 1
	question_answered.emit(correct)
	if current_question >= total:
		var stars = _calc_stars()
		game_finished.emit(score, total, stars)
		_send_results_to_react(stars)
	return correct

func _calc_stars() -> int:
	var pct = float(score) / float(total)
	if pct >= 0.9:
		return 3
	elif pct >= 0.6:
		return 2
	elif pct >= 0.3:
		return 1
	return 0

func _send_results_to_react(stars: int) -> void:
	var js_code = """
	if (window.parent && window.parent !== window) {
		window.parent.postMessage({
			type: 'godot-game-result',
			gameId: 'maths-world',
			score: %d,
			total: %d,
			stars: %d,
			streak: %d,
			bestStreak: %d,
			correct: %d
		}, '*');
	}
	""" % [score, total, stars, streak, best_streak, score]
	JavaScriptBridge.eval(js_code)

func is_finished() -> bool:
	return current_question >= total

func get_progress_text() -> String:
	return "%d / %d" % [current_question + 1, total]
