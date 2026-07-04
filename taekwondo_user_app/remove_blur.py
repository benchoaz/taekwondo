import re

with open('lib/features/dashboard/presentation/member_dashboard_screen.dart', 'r') as f:
    content = f.read()

# Remove BackdropFilter from TopAppBar
content = content.replace('''    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
        child: Container(''', '''    return ClipRect(
      child: Container(''')
content = content.replace('''          ),
        ),
      ),
    );
  }

  Widget _buildHeroAttendanceSection()''', '''          ),
        ),
    );
  }

  Widget _buildHeroAttendanceSection()''')

# Remove BackdropFilter from Tag in EventCard
content = content.replace('''                  child: ClipRect(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                      child: Container(''', '''                  child: ClipRect(
                    child: Container(''')
content = content.replace('''                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),''', '''                      ),
                  ),
                ),
              ],
            ),
          ),''')

# Remove BackdropFilter from BottomNavBar
content = content.replace('''  Widget _buildBottomNavBar() {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(''', '''  Widget _buildBottomNavBar() {
    return ClipRect(
      child: Container(''')
content = content.replace('''              _buildNavItem(2, const Icon(Icons.person, size: 26), 'PROFIL'),
            ],
          ),
        ),
      ),
    );
  }''', '''              _buildNavItem(2, const Icon(Icons.person, size: 26), 'PROFIL'),
            ],
          ),
        ),
    );
  }''')

# Remove BackdropFilter from ImageFilterWidget
content = content.replace('''  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
        child: child,
      ),
    );
  }''', '''  Widget build(BuildContext context) {
    return ClipRect(
      child: child,
    );
  }''')

with open('lib/features/dashboard/presentation/member_dashboard_screen.dart', 'w') as f:
    f.write(content)

