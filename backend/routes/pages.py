# routes/pages.py
from flask import Blueprint, render_template

pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/admin/dashboard')
def admin_dashboard():
    stats = {
        'sales': '1,259',
        'purchases': '352', 
        'orders': '894',
        'profit': '12,584',
        'progress': '65'
    }
    return render_template('dashboard.html', stats=stats, username="Nadaaaaaa")

@pages_bp.route('/admin/clients')
def admin_clients():
    return render_template('clients.html', username="Nadaaaaaa")

@pages_bp.route('/admin/properties')
def admin_properties():
    return render_template('properties.html', username="Nadaaaaaa")

@pages_bp.route('/admin/appointments')
def admin_appointments():
    return render_template('appointments.html', username="Nadaaaaaa")

@pages_bp.route('/admin/transactions')
def admin_transactions():
    return render_template('transactions.html', username="Nadaaaaaa")

@pages_bp.route('/admin/settings')
def admin_settings():
    return render_template('settings.html', username="Nadaaaaaa")

# Route de secours pour les pages non implémentées
@pages_bp.route('/admin/<page_name>')
def admin_page(page_name):
    return render_template('coming_soon.html', page_name=page_name, username="Nadaaaaaa")