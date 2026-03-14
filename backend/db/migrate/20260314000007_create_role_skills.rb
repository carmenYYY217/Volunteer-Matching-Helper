class CreateRoleSkills < ActiveRecord::Migration[7.0]
  def change
    create_table :role_skills do |t|
      t.references :role, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true

      t.timestamps
    end
    add_index :role_skills, [:role_id, :skill_id], unique: true
  end
end
