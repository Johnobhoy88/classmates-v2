# Classmates — HighlandAI
# © 2026 John McMillan (HighlandAI). All rights reserved.
# Licensed under CC BY-NC 4.0

extends Control

## HUD overlay showing the current question and answer buttons

@onready var prompt_label: Label = $Panel/VBox/PromptLabel
@onready var progress_label: Label = $Panel/VBox/ProgressLabel
@onready var score_label: Label = $ScorePanel/ScoreLabel
@onready var feedback_label: Label = $FeedbackLabel
@onready var btn_a: Button = $Panel/VBox/Grid/BtnA
@onready var btn_b: Button = $Panel/VBox/Grid/BtnB
@onready var btn_c: Button = $Panel/VBox/Grid/BtnC
@onready var btn_d: Button = $Panel/VBox/Grid/BtnD
@onready var results_panel: Panel = $ResultsPanel
@onready var results_label: Label = $ResultsPanel/VBox/ResultsLabel
@onready var stars_label: Label = $ResultsPanel/VBox/StarsLabel

var game_manager: Node
var buttons: Array[Button]

func _ready() -> void:
	game_manager = get_node("/root/Main/GameManager")
	buttons = [btn_a, btn_b, btn_c, btn_d]
	for btn in buttons:
		btn.pressed.connect(_on_answer_pressed.bind(btn))
	game_manager.question_answered.connect(_on_question_answered)
	game_manager.game_finished.connect(_on_game_finished)
	results_panel.visible = false
	feedback_label.visible = false
	_show_question()

func _show_question() -> void:
	var q = game_manager.get_current_question()
	if q.is_empty():
		return
	prompt_label.text = q["prompt"]
	progress_label.text = game_manager.get_progress_text()
	score_label.text = "Score: %d" % game_manager.score
	var options = q["options"]
	for i in range(4):
		buttons[i].text = str(options[i])
		buttons[i].disabled = false
		buttons[i].modulate = Color.WHITE

func _on_answer_pressed(btn: Button) -> void:
	var selected = int(btn.text)
	var correct = game_manager.submit_answer(selected)

	for b in buttons:
		b.disabled = true

	if correct:
		btn.modulate = Color.GREEN
		feedback_label.text = "Correct!"
		feedback_label.modulate = Color.GREEN
	else:
		btn.modulate = Color.RED
		feedback_label.text = "Wrong! Answer: %d" % game_manager.get_current_question().get("answer", 0)
		feedback_label.modulate = Color.RED
		# Highlight correct answer
		var q = game_manager.questions[game_manager.current_question - 1]
		for b in buttons:
			if int(b.text) == q["answer"]:
				b.modulate = Color.GREEN

	feedback_label.visible = true
	score_label.text = "Score: %d" % game_manager.score

	if not game_manager.is_finished():
		await get_tree().create_timer(1.2).timeout
		feedback_label.visible = false
		_show_question()

func _on_question_answered(_correct: bool) -> void:
	pass

func _on_game_finished(score: int, total: int, stars: int) -> void:
	await get_tree().create_timer(1.5).timeout
	feedback_label.visible = false
	results_panel.visible = true
	var star_text = ""
	for i in range(3):
		star_text += "★" if i < stars else "☆"
	stars_label.text = star_text
	results_label.text = "%d / %d correct\nBest streak: %d" % [score, total, game_manager.best_streak]
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
