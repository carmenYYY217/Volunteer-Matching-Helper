class VolunteerSkill < ApplicationRecord
  belongs_to :volunteer
  belongs_to :skill

  validates :volunteer_id, uniqueness: { scope: :skill_id }
end
