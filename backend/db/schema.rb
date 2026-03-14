# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_14_090835) do
  create_table "admins", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admins_on_email", unique: true
  end

  create_table "availabilities", force: :cascade do |t|
    t.integer "volunteer_id", null: false
    t.string "day_of_week", null: false
    t.string "time_of_day", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["volunteer_id"], name: "index_availabilities_on_volunteer_id"
  end

  create_table "role_skills", force: :cascade do |t|
    t.integer "role_id", null: false
    t.integer "skill_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role_id", "skill_id"], name: "index_role_skills_on_role_id_and_skill_id", unique: true
    t.index ["role_id"], name: "index_role_skills_on_role_id"
    t.index ["skill_id"], name: "index_role_skills_on_skill_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.date "event_date"
    t.string "status", default: "open"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "skills", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_skills_on_name", unique: true
  end

  create_table "volunteer_skills", force: :cascade do |t|
    t.integer "volunteer_id", null: false
    t.integer "skill_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id"], name: "index_volunteer_skills_on_skill_id"
    t.index ["volunteer_id", "skill_id"], name: "index_volunteer_skills_on_volunteer_id_and_skill_id", unique: true
    t.index ["volunteer_id"], name: "index_volunteer_skills_on_volunteer_id"
  end

  create_table "volunteers", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "phone"
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "target_role"
    t.string "location"
    t.text "cv_url"
    t.index ["email"], name: "index_volunteers_on_email", unique: true
  end

  add_foreign_key "availabilities", "volunteers"
  add_foreign_key "role_skills", "roles"
  add_foreign_key "role_skills", "skills"
  add_foreign_key "volunteer_skills", "skills"
  add_foreign_key "volunteer_skills", "volunteers"
end
