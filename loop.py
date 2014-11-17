import subprocess	# for making shell calls
wd = './10_loop/'
bash_command_file = wd+'commands.txt'

# Runs a command in terminal
def bash(command):
    "Runs shell command"
    print "bash: ",command
    subprocess.call(command, shell=True)
    return

# Read a file and execute each line in bash
def execute_bash_commands():
    f = open(bash_command_file, 'r')
    # Unill end of line
    while True:
        # Read each line and strip any trailing characters
        f_command = f.readline()
        f_command = f_command.rstrip()
        if not f_command: break
        bash(f_command)
    return

# Main
def main():
    execute_bash_commands()
    return
main()
