with open('lib/features/dashboard/presentation/member_dashboard_screen.dart', 'r') as f:
    content = f.read()

import re
# Find the build method and replace it entirely
new_content = re.sub(
    r'  @override\n  Widget build\(BuildContext context\) \{.*',
    r'''  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.yellow,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("DASBOR BERHASIL DIMUAT!", style: TextStyle(fontSize: 40, color: Colors.black, fontWeight: FontWeight.bold)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => context.go('/login'),
              child: Text("KEMBALI KE LOGIN"),
            )
          ],
        ),
      ),
    );
  }
}
''',
    content,
    flags=re.DOTALL
)

with open('lib/features/dashboard/presentation/member_dashboard_screen.dart', 'w') as f:
    f.write(new_content)
