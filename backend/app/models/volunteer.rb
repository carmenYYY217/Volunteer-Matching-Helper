class Volunteer < ApplicationRecord
  has_many :availabilities, dependent: :destroy
  has_many :volunteer_skills, dependent: :destroy
  has_many :skills, through: :volunteer_skills

  validates :first_name, :last_name, presence: true
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validate :must_have_email_or_phone

  # Scopes for filtering
  scope :with_skill, ->(skill_id) {
    joins(:skills).where(skills: { id: skill_id }) if skill_id.present?
  }

  scope :available_on, ->(day) {
    joins(:availabilities).where(availabilities: { day_of_week: day }) if day.present?
  }

  def skills_attributes=(attributes)
    # Convert Hash to Array if necessary, otherwise use the Array from React
    attributes_array = attributes.is_a?(Hash) ? attributes.values : attributes

    attributes_array.each do |skill_attr|
      next if skill_attr.nil? || skill_attr["name"].blank?
      
      # Find the skill from the seeded database, or create it if it's brand new
      # Use the normalized name to avoid duplicate validation errors
      skill = Skill.find_or_create_by(name: skill_attr["name"].to_s.strip.downcase)
      self.skills << skill unless self.skills.include?(skill)
    end
  end

  def availabilities_attributes=(attributes)
    attributes_array = attributes.is_a?(Hash) ? attributes.values : attributes
    
    attributes_array.each do |avail_attr|
      next if avail_attr.nil? || avail_attr["day_of_week"].blank? || avail_attr["time_of_day"].blank?
      
      avail = Availability.find_or_create_by(
        day_of_week: avail_attr["day_of_week"], 
        time_of_day: avail_attr["time_of_day"]
      )
      self.availabilities << avail unless self.availabilities.include?(avail)
    end
  end

  private

  def must_have_email_or_phone
    if email.blank? && phone.blank?
      errors.add(:base, "You must provide either an email address or a phone number")
    end
  end
end
