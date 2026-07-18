from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, UTC
from sqlalchemy import CheckConstraint

bcrypt = Bcrypt()
db = SQLAlchemy()

def connect_db(app):
    db.app = app
    db.init_app(app)

class Users(db.Model):
    """Site user."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, 
                   primary_key=True, 
                   autoincrement=True, 
                   )
    username = db.Column(
        db.String(30),
        nullable=False,
        unique=True,
    )
    
    password_hash = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(50), nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)


    @classmethod
    def register(cls,first_name,last_name,email,username,password):
        """Register a user, hashing their password."""

        hashed = bcrypt.generate_password_hash(password)
        hashed_utf8 = hashed.decode("utf8")
        user = cls(
            
            username=username,
            password_hash=hashed_utf8,
            first_name=first_name,
            last_name=last_name,
            email=email
        )

        db.session.add(user)
        return user

    @classmethod
    def authenticate(cls, username, password):

        user = Users.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password_hash, password):
            return user
        else:
            return False
        
class Restrooms(db.Model):
    __tablename__ = "restrooms"

    restroom_id = db.Column(db.Integer, 
                   primary_key=True, 
                   autoincrement=True, 
                   )
    restroom_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Numeric(9,6))
    longitude = db.Column(db.Numeric(9,6))
    hours_of_operation = db.Column(db.Text, nullable=True)
    status = db.Column(db.Text, nullable=True)
    changing_stations = db.Column(db.Text, nullable=True)
    accessibility = db.Column(db.Text, nullable=True)
    additional_notes = db.Column(db.Text, nullable=True)


class Favorites(db.Model):
    __tablename__ = "favorites"
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        primary_key=True,
        nullable=False
    )
    restroom_id = db.Column(
        db.Integer,
        db.ForeignKey('restrooms.restroom_id'),
        primary_key=True,
        nullable=False
    )

    user = db.relationship("Users", backref="favorites")
    restroom = db.relationship("Restrooms", backref="favorites")

class Reviews(db.Model):
    __tablename__ = "reviews"
    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        nullable=False
    )
    restroom_id = db.Column(
        db.Integer,
        db.ForeignKey('restrooms.restroom_id'),
        nullable=False
    )
    review = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='rating_range'),
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC)
    )

    user = db.relationship("Users", backref="reviews")
    restroom = db.relationship("Restrooms", backref="reviews")

class Comments(db.Model):
    __tablename__ = "comments"
    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        nullable=False
    )
    review_id = db.Column(
        db.Integer,
        db.ForeignKey('reviews.review_id'),
        nullable=False,   
    )
    parent_comment_id = db.Column(
        db.Integer,
        db.ForeignKey('comments.comment_id'),
        nullable=True
    )
    comment = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC)
    )

    user = db.relationship("Users", backref="comments")
    review = db.relationship("Reviews", backref="comments")
    parent = db.relationship(
        "Comments",
        remote_side=[comment_id],
        backref="replies"
    )




