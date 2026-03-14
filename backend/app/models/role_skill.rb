class RoleSkill < ApplicationRecord
  belongs_to :role
  belongs_to :skill

  validates :role_id, uniqueness: { scope: :skill_id }
end
